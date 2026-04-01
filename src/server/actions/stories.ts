"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditor } from "@/lib/permissions/guards";
import { createClient } from "@/lib/supabase/server";
import { archiveStorySchema, createStorySchema, updateStorySchema } from "@/lib/validation/story";

type StoryActionErrorCode =
  | "invalid_form"
  | "invalid_story"
  | "invalid_member"
  | "archived_member"
  | "save_failed"
  | "archive_failed";

function toFormObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function redirectCreateStoryError(error: StoryActionErrorCode, personId?: string): never {
  const params = new URLSearchParams({ error });
  if (personId) {
    params.set("personId", personId);
  }

  redirect(`/cerita-baru?${params.toString()}`);
}

function redirectEditStoryError(storyId: string, error: StoryActionErrorCode): never {
  redirect(`/cerita/${storyId}/edit?error=${error}`);
}

function revalidateStoryPaths(storyId: string, personIds: string[]) {
  revalidatePath("/timeline");
  revalidatePath(`/cerita/${storyId}`);
  revalidatePath(`/cerita/${storyId}/edit`);

  Array.from(new Set(personIds)).forEach((personId) => {
    revalidatePath(`/keluarga/${personId}`);
  });
}

async function ensureActiveMember(personId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("people")
    .select("id, is_archived")
    .eq("id", personId)
    .maybeSingle();

  if (error || !data) {
    return { ok: false as const, reason: "invalid_member" as const };
  }

  if (data.is_archived) {
    return { ok: false as const, reason: "archived_member" as const };
  }

  return { ok: true as const };
}

async function getStoryRow(storyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stories")
    .select("id, person_id, is_archived")
    .eq("id", storyId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function createStoryAction(formData: FormData) {
  const raw = toFormObject(formData);
  const parsed = createStorySchema.safeParse(raw);

  if (!parsed.success) {
    const fallbackPersonId = typeof raw.person_id === "string" ? raw.person_id : undefined;
    redirectCreateStoryError("invalid_form", fallbackPersonId);
  }

  const { user } = await requireEditor("/cerita-baru");
  const activeMemberCheck = await ensureActiveMember(parsed.data.person_id);
  if (!activeMemberCheck.ok) {
    redirectCreateStoryError(activeMemberCheck.reason, parsed.data.person_id);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stories")
    .insert({
      person_id: parsed.data.person_id,
      title: parsed.data.title,
      body: parsed.data.body,
      event_date: parsed.data.event_date ?? null,
      created_by: user.id,
      updated_by: user.id
    })
    .select("id")
    .single();

  if (error || !data) {
    redirectCreateStoryError("save_failed", parsed.data.person_id);
  }

  revalidateStoryPaths(data.id, [parsed.data.person_id]);
  redirect(`/cerita/${data.id}?status=created`);
}

export async function updateStoryAction(formData: FormData) {
  const raw = toFormObject(formData);
  const parsed = updateStorySchema.safeParse(raw);

  if (!parsed.success) {
    const fallbackStoryId = typeof raw.story_id === "string" ? raw.story_id : "";
    redirectEditStoryError(fallbackStoryId, "invalid_form");
  }

  const { user } = await requireEditor(`/cerita/${parsed.data.story_id}/edit`);
  const currentStory = await getStoryRow(parsed.data.story_id);

  if (!currentStory) {
    redirectEditStoryError(parsed.data.story_id, "invalid_story");
  }

  const activeMemberCheck = await ensureActiveMember(parsed.data.person_id);
  if (!activeMemberCheck.ok) {
    redirectEditStoryError(parsed.data.story_id, activeMemberCheck.reason);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("stories")
    .update({
      person_id: parsed.data.person_id,
      title: parsed.data.title,
      body: parsed.data.body,
      event_date: parsed.data.event_date ?? null,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    })
    .eq("id", parsed.data.story_id);

  if (error) {
    redirectEditStoryError(parsed.data.story_id, "save_failed");
  }

  revalidateStoryPaths(parsed.data.story_id, [currentStory.person_id, parsed.data.person_id]);
  redirect(`/cerita/${parsed.data.story_id}?status=updated`);
}

export async function archiveStoryAction(formData: FormData) {
  const raw = toFormObject(formData);
  const parsed = archiveStorySchema.safeParse(raw);

  if (!parsed.success) {
    const fallbackStoryId = typeof raw.story_id === "string" ? raw.story_id : "";
    redirectEditStoryError(fallbackStoryId, "invalid_story");
  }

  const { user } = await requireEditor(`/cerita/${parsed.data.story_id}/edit`);
  const currentStory = await getStoryRow(parsed.data.story_id);

  if (!currentStory) {
    redirectEditStoryError(parsed.data.story_id, "invalid_story");
  }

  if (currentStory.is_archived) {
    redirect(`/cerita/${parsed.data.story_id}/edit?status=archived`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("stories")
    .update({
      is_archived: true,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    })
    .eq("id", parsed.data.story_id);

  if (error) {
    redirectEditStoryError(parsed.data.story_id, "archive_failed");
  }

  revalidateStoryPaths(parsed.data.story_id, [currentStory.person_id]);
  redirect(`/cerita/${parsed.data.story_id}/edit?status=archived`);
}
