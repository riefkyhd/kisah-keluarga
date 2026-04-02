"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditor } from "@/lib/permissions/guards";
import { sanitizeInternalReturnTo, withQueryParam } from "@/lib/navigation/return-to";
import {
  addChildRelationshipSchema,
  addParentRelationshipSchema,
  addSpouseRelationshipSchema,
  archiveRelationshipSchema
} from "@/lib/validation/relationship";
import { createClient } from "@/lib/supabase/server";

type ActionErrorCode =
  | "invalid_relationship"
  | "self_link"
  | "duplicate_relationship"
  | "illegal_relationship"
  | "archived_person"
  | "save_failed"
  | "archive_failed";

function toFormObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function redirectWithRelationshipError(targetPath: string, error: ActionErrorCode): never {
  redirect(withQueryParam(targetPath, "relationship_error", error));
}

function redirectWithRelationshipStatus(targetPath: string, status: string): never {
  redirect(withQueryParam(targetPath, "relationship_status", status));
}

async function ensureActivePeople(personId: string, relatedPersonId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("people")
    .select("id, is_archived")
    .in("id", [personId, relatedPersonId]);

  if (error || !data || data.length < 2) {
    return { ok: false as const, reason: "invalid_relationship" as const };
  }

  const hasArchived = data.some((person) => person.is_archived === true);
  if (hasArchived) {
    return { ok: false as const, reason: "archived_person" as const };
  }

  return { ok: true as const };
}

async function hasActiveRelationship(fromPersonId: string, toPersonId: string, relationshipType: "parent" | "spouse") {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("relationships")
    .select("id")
    .eq("from_person_id", fromPersonId)
    .eq("to_person_id", toPersonId)
    .eq("relationship_type", relationshipType)
    .eq("is_archived", false)
    .maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data);
}

async function hasAnyActiveSpouse(personId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("relationships")
    .select("id")
    .eq("relationship_type", "spouse")
    .eq("is_archived", false)
    .or(`from_person_id.eq.${personId},to_person_id.eq.${personId}`)
    .limit(1);

  if (error) {
    return false;
  }

  return Boolean(data && data.length > 0);
}

async function insertRelationshipEdge(params: {
  fromPersonId: string;
  toPersonId: string;
  relationshipType: "parent" | "spouse";
  actorUserId: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("relationships").insert({
    from_person_id: params.fromPersonId,
    to_person_id: params.toPersonId,
    relationship_type: params.relationshipType,
    created_by: params.actorUserId,
    updated_by: params.actorUserId
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false as const, reason: "duplicate_relationship" as const };
    }

    return { ok: false as const, reason: "save_failed" as const };
  }

  return { ok: true as const };
}

function normalizeSpousePair(personId: string, relatedPersonId: string) {
  return personId < relatedPersonId
    ? { fromPersonId: personId, toPersonId: relatedPersonId }
    : { fromPersonId: relatedPersonId, toPersonId: personId };
}

function revalidateRelationshipPaths(personIds: string[]) {
  revalidatePath("/");
  revalidatePath("/keluarga");
  Array.from(new Set(personIds)).forEach((personId) => {
    revalidatePath(`/keluarga/${personId}`);
  });
}

export async function addParentRelationshipAction(formData: FormData) {
  const raw = toFormObject(formData);
  const rawReturnTo = formData.get("return_to");
  if (raw.person_id === raw.related_person_id) {
    const personId = typeof raw.person_id === "string" ? raw.person_id : "";
    const fallbackPath = personId ? `/keluarga/${personId}` : "/keluarga";
    const returnTo = sanitizeInternalReturnTo(rawReturnTo, fallbackPath);
    redirectWithRelationshipError(returnTo, "self_link");
  }

  const parsed = addParentRelationshipSchema.safeParse(raw);
  if (!parsed.success) {
    const fallbackPersonId = typeof raw.person_id === "string" ? raw.person_id : "";
    const fallbackPath = fallbackPersonId ? `/keluarga/${fallbackPersonId}` : "/keluarga";
    const returnTo = sanitizeInternalReturnTo(rawReturnTo, fallbackPath);
    redirectWithRelationshipError(returnTo, "invalid_relationship");
  }

  const personId = parsed.data.person_id;
  const returnTo = sanitizeInternalReturnTo(rawReturnTo, `/keluarga/${personId}`);
  const parentId = parsed.data.related_person_id;
  const { user } = await requireEditor(`/keluarga/${personId}`);

  const peopleCheck = await ensureActivePeople(personId, parentId);
  if (!peopleCheck.ok) {
    redirectWithRelationshipError(returnTo, peopleCheck.reason);
  }

  if (await hasActiveRelationship(parentId, personId, "parent")) {
    redirectWithRelationshipError(returnTo, "duplicate_relationship");
  }

  if (await hasActiveRelationship(personId, parentId, "parent")) {
    redirectWithRelationshipError(returnTo, "illegal_relationship");
  }

  if (
    (await hasActiveRelationship(personId, parentId, "spouse")) ||
    (await hasActiveRelationship(parentId, personId, "spouse"))
  ) {
    redirectWithRelationshipError(returnTo, "illegal_relationship");
  }

  const result = await insertRelationshipEdge({
    fromPersonId: parentId,
    toPersonId: personId,
    relationshipType: "parent",
    actorUserId: user.id
  });

  if (!result.ok) {
    redirectWithRelationshipError(returnTo, result.reason);
  }

  revalidateRelationshipPaths([personId, parentId]);
  redirectWithRelationshipStatus(returnTo, "added_parent");
}

export async function addChildRelationshipAction(formData: FormData) {
  const raw = toFormObject(formData);
  const rawReturnTo = formData.get("return_to");
  if (raw.person_id === raw.related_person_id) {
    const personId = typeof raw.person_id === "string" ? raw.person_id : "";
    const fallbackPath = personId ? `/keluarga/${personId}` : "/keluarga";
    const returnTo = sanitizeInternalReturnTo(rawReturnTo, fallbackPath);
    redirectWithRelationshipError(returnTo, "self_link");
  }

  const parsed = addChildRelationshipSchema.safeParse(raw);
  if (!parsed.success) {
    const fallbackPersonId = typeof raw.person_id === "string" ? raw.person_id : "";
    const fallbackPath = fallbackPersonId ? `/keluarga/${fallbackPersonId}` : "/keluarga";
    const returnTo = sanitizeInternalReturnTo(rawReturnTo, fallbackPath);
    redirectWithRelationshipError(returnTo, "invalid_relationship");
  }

  const personId = parsed.data.person_id;
  const returnTo = sanitizeInternalReturnTo(rawReturnTo, `/keluarga/${personId}`);
  const childId = parsed.data.related_person_id;
  const { user } = await requireEditor(`/keluarga/${personId}`);

  const peopleCheck = await ensureActivePeople(personId, childId);
  if (!peopleCheck.ok) {
    redirectWithRelationshipError(returnTo, peopleCheck.reason);
  }

  if (await hasActiveRelationship(personId, childId, "parent")) {
    redirectWithRelationshipError(returnTo, "duplicate_relationship");
  }

  if (await hasActiveRelationship(childId, personId, "parent")) {
    redirectWithRelationshipError(returnTo, "illegal_relationship");
  }

  if (
    (await hasActiveRelationship(personId, childId, "spouse")) ||
    (await hasActiveRelationship(childId, personId, "spouse"))
  ) {
    redirectWithRelationshipError(returnTo, "illegal_relationship");
  }

  const result = await insertRelationshipEdge({
    fromPersonId: personId,
    toPersonId: childId,
    relationshipType: "parent",
    actorUserId: user.id
  });

  if (!result.ok) {
    redirectWithRelationshipError(returnTo, result.reason);
  }

  revalidateRelationshipPaths([personId, childId]);
  redirectWithRelationshipStatus(returnTo, "added_child");
}

export async function addSpouseRelationshipAction(formData: FormData) {
  const raw = toFormObject(formData);
  const rawReturnTo = formData.get("return_to");
  if (raw.person_id === raw.related_person_id) {
    const personId = typeof raw.person_id === "string" ? raw.person_id : "";
    const fallbackPath = personId ? `/keluarga/${personId}` : "/keluarga";
    const returnTo = sanitizeInternalReturnTo(rawReturnTo, fallbackPath);
    redirectWithRelationshipError(returnTo, "self_link");
  }

  const parsed = addSpouseRelationshipSchema.safeParse(raw);
  if (!parsed.success) {
    const fallbackPersonId = typeof raw.person_id === "string" ? raw.person_id : "";
    const fallbackPath = fallbackPersonId ? `/keluarga/${fallbackPersonId}` : "/keluarga";
    const returnTo = sanitizeInternalReturnTo(rawReturnTo, fallbackPath);
    redirectWithRelationshipError(returnTo, "invalid_relationship");
  }

  const personId = parsed.data.person_id;
  const returnTo = sanitizeInternalReturnTo(rawReturnTo, `/keluarga/${personId}`);
  const relatedPersonId = parsed.data.related_person_id;
  const { user } = await requireEditor(`/keluarga/${personId}`);

  const peopleCheck = await ensureActivePeople(personId, relatedPersonId);
  if (!peopleCheck.ok) {
    redirectWithRelationshipError(returnTo, peopleCheck.reason);
  }

  const pair = normalizeSpousePair(personId, relatedPersonId);
  if (await hasActiveRelationship(pair.fromPersonId, pair.toPersonId, "spouse")) {
    redirectWithRelationshipError(returnTo, "duplicate_relationship");
  }

  if (
    (await hasActiveRelationship(pair.fromPersonId, pair.toPersonId, "parent")) ||
    (await hasActiveRelationship(pair.toPersonId, pair.fromPersonId, "parent"))
  ) {
    redirectWithRelationshipError(returnTo, "illegal_relationship");
  }

  if ((await hasAnyActiveSpouse(personId)) || (await hasAnyActiveSpouse(relatedPersonId))) {
    redirectWithRelationshipError(returnTo, "illegal_relationship");
  }

  const result = await insertRelationshipEdge({
    fromPersonId: pair.fromPersonId,
    toPersonId: pair.toPersonId,
    relationshipType: "spouse",
    actorUserId: user.id
  });

  if (!result.ok) {
    redirectWithRelationshipError(returnTo, result.reason);
  }

  revalidateRelationshipPaths([personId, relatedPersonId]);
  redirectWithRelationshipStatus(returnTo, "added_spouse");
}

export async function archiveRelationshipAction(formData: FormData) {
  const raw = toFormObject(formData);
  const rawReturnTo = formData.get("return_to");
  const parsed = archiveRelationshipSchema.safeParse(raw);
  if (!parsed.success) {
    const fallbackPersonId = typeof raw.person_id === "string" ? raw.person_id : "";
    const fallbackPath = fallbackPersonId ? `/keluarga/${fallbackPersonId}` : "/keluarga";
    const returnTo = sanitizeInternalReturnTo(rawReturnTo, fallbackPath);
    redirectWithRelationshipError(returnTo, "invalid_relationship");
  }

  const personId = parsed.data.person_id;
  const returnTo = sanitizeInternalReturnTo(rawReturnTo, `/keluarga/${personId}`);
  const { user } = await requireEditor(`/keluarga/${personId}`);
  const supabase = await createClient();
  const { data: relationship, error: relationshipError } = await supabase
    .from("relationships")
    .select("id, from_person_id, to_person_id, is_archived")
    .eq("id", parsed.data.relationship_id)
    .maybeSingle();

  if (relationshipError || !relationship) {
    redirectWithRelationshipError(returnTo, "invalid_relationship");
  }

  if (relationship.from_person_id !== personId && relationship.to_person_id !== personId) {
    redirectWithRelationshipError(returnTo, "invalid_relationship");
  }

  if (relationship.is_archived) {
    redirectWithRelationshipStatus(returnTo, "archived");
  }

  const { error } = await supabase
    .from("relationships")
    .update({
      is_archived: true,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    })
    .eq("id", relationship.id);

  if (error) {
    redirectWithRelationshipError(returnTo, "archive_failed");
  }

  revalidateRelationshipPaths([relationship.from_person_id, relationship.to_person_id]);
  redirectWithRelationshipStatus(returnTo, "archived");
}
