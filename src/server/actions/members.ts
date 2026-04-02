"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sanitizeInternalReturnTo, withQueryParam } from "@/lib/navigation/return-to";
import { requireEditor } from "@/lib/permissions/guards";
import { createClient } from "@/lib/supabase/server";
import { createMemberSchema, memberArchiveSchema, updateMemberSchema } from "@/lib/validation/member";

export type MemberMutationError = "invalid_form" | "save_failed";
export type MemberMutationStatus = "created" | "updated";
export type MemberMutationResult =
  | { ok: true; personId: string; status: MemberMutationStatus }
  | { ok: false; error: MemberMutationError };

function toFormObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function getActionMode(formData: FormData): "redirect" | "result" {
  return formData.get("action_mode") === "result" ? "result" : "redirect";
}

function getSuccessRedirect(formData: FormData) {
  const raw = formData.get("success_redirect");
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return null;
  }

  const safePath = sanitizeInternalReturnTo(raw, "");
  return safePath || null;
}

function revalidateMemberPaths(personId: string) {
  revalidatePath("/");
  revalidatePath("/keluarga");
  revalidatePath(`/keluarga/${personId}`);
}

function redirectWithEditError(targetPath: string, error: string): never {
  redirect(withQueryParam(targetPath, "error", error));
}

function redirectWithEditStatus(targetPath: string, status: string): never {
  redirect(withQueryParam(targetPath, "status", status));
}

export async function createMemberAction(formData: FormData) {
  const actionMode = getActionMode(formData);
  const successRedirect = getSuccessRedirect(formData);
  const { user } = await requireEditor("/anggota-baru");
  const parsed = createMemberSchema.safeParse(toFormObject(formData));

  if (!parsed.success) {
    if (actionMode === "result") {
      return { ok: false, error: "invalid_form" } satisfies MemberMutationResult;
    }

    if (successRedirect) {
      redirect(withQueryParam(successRedirect, "error", "invalid_form"));
    }

    redirect("/anggota-baru?error=invalid_form");
  }

  const payload = {
    ...parsed.data,
    created_by: user.id,
    updated_by: user.id
  };

  const supabase = await createClient();
  const { data, error } = await supabase.from("people").insert(payload).select("id").single();

  if (error || !data) {
    if (actionMode === "result") {
      return { ok: false, error: "save_failed" } satisfies MemberMutationResult;
    }

    if (successRedirect) {
      redirect(withQueryParam(successRedirect, "error", "save_failed"));
    }

    redirect("/anggota-baru?error=save_failed");
  }

  revalidateMemberPaths(data.id);
  if (actionMode === "result") {
    return { ok: true, personId: data.id, status: "created" } satisfies MemberMutationResult;
  }

  if (successRedirect) {
    redirect(withQueryParam(successRedirect, "status", "created"));
  }

  redirect(`/keluarga/${data.id}?created=1`);
}

export async function updateMemberAction(formData: FormData) {
  const actionMode = getActionMode(formData);
  const successRedirect = getSuccessRedirect(formData);
  const parsed = updateMemberSchema.safeParse(toFormObject(formData));

  if (!parsed.success) {
    const fallbackPersonId =
      typeof formData.get("person_id") === "string" ? String(formData.get("person_id")) : "";
    if (actionMode === "result") {
      return { ok: false, error: "invalid_form" } satisfies MemberMutationResult;
    }

    if (successRedirect) {
      redirect(withQueryParam(successRedirect, "error", "invalid_form"));
    }

    redirect(`/anggota/${fallbackPersonId}/edit?error=invalid_form`);
  }

  const { user } = await requireEditor(`/anggota/${parsed.data.person_id}/edit`);
  const supabase = await createClient();

  const { error } = await supabase
    .from("people")
    .update({
      full_name: parsed.data.full_name,
      nickname: parsed.data.nickname,
      gender: parsed.data.gender,
      birth_date: parsed.data.birth_date,
      death_date: parsed.data.death_date,
      bio: parsed.data.bio,
      is_living: parsed.data.is_living,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    })
    .eq("id", parsed.data.person_id);

  if (error) {
    if (actionMode === "result") {
      return { ok: false, error: "save_failed" } satisfies MemberMutationResult;
    }

    if (successRedirect) {
      redirect(withQueryParam(successRedirect, "error", "save_failed"));
    }

    redirect(`/anggota/${parsed.data.person_id}/edit?error=save_failed`);
  }

  revalidateMemberPaths(parsed.data.person_id);
  if (actionMode === "result") {
    return {
      ok: true,
      personId: parsed.data.person_id,
      status: "updated"
    } satisfies MemberMutationResult;
  }

  if (successRedirect) {
    redirect(withQueryParam(successRedirect, "status", "updated"));
  }

  redirect(`/keluarga/${parsed.data.person_id}?updated=1`);
}

export async function archiveMemberAction(formData: FormData) {
  const parsed = memberArchiveSchema.safeParse(toFormObject(formData));

  if (!parsed.success) {
    redirect("/keluarga?error=invalid_member");
  }

  const returnTo = sanitizeInternalReturnTo(
    formData.get("return_to"),
    `/anggota/${parsed.data.person_id}/edit`
  );
  const { user } = await requireEditor(`/anggota/${parsed.data.person_id}/edit`);
  const supabase = await createClient();
  const { error } = await supabase
    .from("people")
    .update({
      is_archived: true,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    })
    .eq("id", parsed.data.person_id);

  if (error) {
    redirectWithEditError(returnTo, "archive_failed");
  }

  revalidateMemberPaths(parsed.data.person_id);
  redirectWithEditStatus(returnTo, "archived");
}

export async function restoreMemberAction(formData: FormData) {
  const parsed = memberArchiveSchema.safeParse(toFormObject(formData));

  if (!parsed.success) {
    redirect("/keluarga?error=invalid_member");
  }

  const returnTo = sanitizeInternalReturnTo(
    formData.get("return_to"),
    `/anggota/${parsed.data.person_id}/edit`
  );
  const { user } = await requireEditor(`/anggota/${parsed.data.person_id}/edit`);
  const supabase = await createClient();
  const { error } = await supabase
    .from("people")
    .update({
      is_archived: false,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    })
    .eq("id", parsed.data.person_id);

  if (error) {
    redirectWithEditError(returnTo, "restore_failed");
  }

  revalidateMemberPaths(parsed.data.person_id);
  redirectWithEditStatus(returnTo, "restored");
}
