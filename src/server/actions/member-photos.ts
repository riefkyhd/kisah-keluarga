"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireEditor } from "@/lib/permissions/guards";
import { createClient } from "@/lib/supabase/server";

const MEMBER_PHOTO_BUCKET = "member-photos";
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const personIdSchema = z.string().uuid("ID anggota tidak valid.");
type PersonPhotoWriteRow = {
  id: string;
  is_archived: boolean;
  profile_photo_path: string | null;
};

function getExtensionFromMimeType(mimeType: string) {
  if (mimeType === "image/jpeg") {
    return "jpg";
  }
  if (mimeType === "image/png") {
    return "png";
  }
  if (mimeType === "image/webp") {
    return "webp";
  }

  return null;
}

function redirectWithPhotoError(personId: string, error: string): never {
  redirect(`/keluarga/${personId}?photo_error=${error}`);
}

function redirectWithPhotoStatus(personId: string, status: string): never {
  redirect(`/keluarga/${personId}?photo_status=${status}`);
}

function revalidatePhotoPaths(personId: string) {
  revalidatePath("/keluarga");
  revalidatePath(`/keluarga/${personId}`);
}

async function getPersonForPhotoWrite(personId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("people")
    .select("id, is_archived, profile_photo_path")
    .eq("id", personId)
    .maybeSingle();

  const person = data as PersonPhotoWriteRow | null;

  if (error || !person) {
    return null;
  }

  return person;
}

export async function uploadOrReplaceMemberPhotoAction(formData: FormData) {
  const rawPersonId = formData.get("person_id");
  const personIdResult = personIdSchema.safeParse(rawPersonId);
  if (!personIdResult.success) {
    redirect("/keluarga?photo_error=invalid_member");
  }

  const personId = personIdResult.data;
  const { user } = await requireEditor(`/keluarga/${personId}`);
  const file = formData.get("photo");

  if (!(file instanceof File) || file.size === 0) {
    redirectWithPhotoError(personId, "missing_file");
  }

  if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
    redirectWithPhotoError(personId, "invalid_file_type");
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    redirectWithPhotoError(personId, "file_too_large");
  }

  const extension = getExtensionFromMimeType(file.type);
  if (!extension) {
    redirectWithPhotoError(personId, "invalid_file_type");
  }

  const person = await getPersonForPhotoWrite(personId);
  if (!person) {
    redirectWithPhotoError(personId, "invalid_member");
  }
  if (person.is_archived) {
    redirectWithPhotoError(personId, "archived_member");
  }

  const newPhotoPath = `members/${personId}/profile-${Date.now()}.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from(MEMBER_PHOTO_BUCKET)
    .upload(newPhotoPath, bytes, {
      contentType: file.type,
      upsert: false
    });

  if (uploadError) {
    redirectWithPhotoError(personId, "upload_failed");
  }

  const previousPhotoPath = person.profile_photo_path;
  const { error: updateError } = await supabase
    .from("people")
    .update({
      profile_photo_path: newPhotoPath,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    })
    .eq("id", personId);

  if (updateError) {
    await supabase.storage.from(MEMBER_PHOTO_BUCKET).remove([newPhotoPath]);
    redirectWithPhotoError(personId, "save_failed");
  }

  if (previousPhotoPath && previousPhotoPath !== newPhotoPath) {
    await supabase.storage.from(MEMBER_PHOTO_BUCKET).remove([previousPhotoPath]);
  }

  revalidatePhotoPaths(personId);
  redirectWithPhotoStatus(personId, previousPhotoPath ? "replaced" : "uploaded");
}

export async function removeMemberPhotoAction(formData: FormData) {
  const rawPersonId = formData.get("person_id");
  const personIdResult = personIdSchema.safeParse(rawPersonId);
  if (!personIdResult.success) {
    redirect("/keluarga?photo_error=invalid_member");
  }

  const personId = personIdResult.data;
  const { user } = await requireEditor(`/keluarga/${personId}`);
  const person = await getPersonForPhotoWrite(personId);
  if (!person) {
    redirectWithPhotoError(personId, "invalid_member");
  }
  if (person.is_archived) {
    redirectWithPhotoError(personId, "archived_member");
  }

  if (!person.profile_photo_path) {
    redirectWithPhotoStatus(personId, "removed");
  }

  const supabase = await createClient();
  const photoPath = person.profile_photo_path;
  const { error: updateError } = await supabase
    .from("people")
    .update({
      profile_photo_path: null,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    })
    .eq("id", personId);

  if (updateError) {
    redirectWithPhotoError(personId, "remove_failed");
  }

  await supabase.storage.from(MEMBER_PHOTO_BUCKET).remove([photoPath]);
  revalidatePhotoPaths(personId);
  redirectWithPhotoStatus(personId, "removed");
}
