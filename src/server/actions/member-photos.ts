"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireEditor } from "@/lib/permissions/guards";
import { sanitizeInternalReturnTo, withQueryParam } from "@/lib/navigation/return-to";
import { createClient } from "@/lib/supabase/server";
import { optimizeProfilePhoto } from "@/server/media/profile-photo-optimizer";

const MEMBER_PHOTO_BUCKET = "member-photos";
const MAX_PHOTO_SIZE_BYTES = 4 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const personIdSchema = z.string().uuid("ID anggota tidak valid.");
type PersonPhotoWriteRow = {
  id: string;
  is_archived: boolean;
  profile_photo_path: string | null;
};

function redirectWithPhotoError(targetPath: string, error: string): never {
  redirect(withQueryParam(targetPath, "photo_error", error));
}

function redirectWithPhotoStatus(targetPath: string, status: string): never {
  redirect(withQueryParam(targetPath, "photo_status", status));
}

function revalidatePhotoPaths(personId: string) {
  revalidatePath("/");
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
  const returnTo = sanitizeInternalReturnTo(formData.get("return_to"), `/keluarga/${personId}`);
  const { user } = await requireEditor(`/keluarga/${personId}`);
  const file = formData.get("photo");

  if (!(file instanceof File) || file.size === 0) {
    redirectWithPhotoError(returnTo, "missing_file");
  }

  if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
    redirectWithPhotoError(returnTo, "invalid_file_type");
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    redirectWithPhotoError(returnTo, "file_too_large");
  }

  const person = await getPersonForPhotoWrite(personId);
  if (!person) {
    redirectWithPhotoError(returnTo, "invalid_member");
  }
  if (person.is_archived) {
    redirectWithPhotoError(returnTo, "archived_member");
  }

  const rawBytes = new Uint8Array(await file.arrayBuffer());
  let optimizedPhoto: Awaited<ReturnType<typeof optimizeProfilePhoto>>;

  try {
    optimizedPhoto = await optimizeProfilePhoto(rawBytes);
  } catch {
    redirectWithPhotoError(returnTo, "optimize_failed");
  }

  const newPhotoPath = `members/${personId}/profile-${Date.now()}.${optimizedPhoto.extension}`;
  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from(MEMBER_PHOTO_BUCKET)
    .upload(newPhotoPath, optimizedPhoto.bytes, {
      contentType: optimizedPhoto.contentType,
      upsert: false
    });

  if (uploadError) {
    redirectWithPhotoError(returnTo, "upload_failed");
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
    redirectWithPhotoError(returnTo, "save_failed");
  }

  if (previousPhotoPath && previousPhotoPath !== newPhotoPath) {
    await supabase.storage.from(MEMBER_PHOTO_BUCKET).remove([previousPhotoPath]);
  }

  revalidatePhotoPaths(personId);
  redirectWithPhotoStatus(returnTo, previousPhotoPath ? "replaced" : "uploaded");
}

export async function removeMemberPhotoAction(formData: FormData) {
  const rawPersonId = formData.get("person_id");
  const personIdResult = personIdSchema.safeParse(rawPersonId);
  if (!personIdResult.success) {
    redirect("/keluarga?photo_error=invalid_member");
  }

  const personId = personIdResult.data;
  const returnTo = sanitizeInternalReturnTo(formData.get("return_to"), `/keluarga/${personId}`);
  const { user } = await requireEditor(`/keluarga/${personId}`);
  const person = await getPersonForPhotoWrite(personId);
  if (!person) {
    redirectWithPhotoError(returnTo, "invalid_member");
  }
  if (person.is_archived) {
    redirectWithPhotoError(returnTo, "archived_member");
  }

  if (!person.profile_photo_path) {
    redirectWithPhotoStatus(returnTo, "removed");
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
    redirectWithPhotoError(returnTo, "remove_failed");
  }

  await supabase.storage.from(MEMBER_PHOTO_BUCKET).remove([photoPath]);
  revalidatePhotoPaths(personId);
  redirectWithPhotoStatus(returnTo, "removed");
}
