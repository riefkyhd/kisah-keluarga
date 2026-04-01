"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditor } from "@/lib/permissions/guards";
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

function redirectWithRelationshipError(personId: string, error: ActionErrorCode): never {
  redirect(`/keluarga/${personId}?relationship_error=${error}`);
}

function redirectWithRelationshipStatus(personId: string, status: string): never {
  redirect(`/keluarga/${personId}?relationship_status=${status}`);
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
  revalidatePath("/keluarga");
  Array.from(new Set(personIds)).forEach((personId) => {
    revalidatePath(`/keluarga/${personId}`);
  });
}

export async function addParentRelationshipAction(formData: FormData) {
  const raw = toFormObject(formData);
  if (raw.person_id === raw.related_person_id) {
    const personId = typeof raw.person_id === "string" ? raw.person_id : "";
    redirectWithRelationshipError(personId, "self_link");
  }

  const parsed = addParentRelationshipSchema.safeParse(raw);
  if (!parsed.success) {
    const fallbackPersonId = typeof raw.person_id === "string" ? raw.person_id : "";
    redirectWithRelationshipError(fallbackPersonId, "invalid_relationship");
  }

  const personId = parsed.data.person_id;
  const parentId = parsed.data.related_person_id;
  const { user } = await requireEditor(`/keluarga/${personId}`);

  const peopleCheck = await ensureActivePeople(personId, parentId);
  if (!peopleCheck.ok) {
    redirectWithRelationshipError(personId, peopleCheck.reason);
  }

  if (await hasActiveRelationship(parentId, personId, "parent")) {
    redirectWithRelationshipError(personId, "duplicate_relationship");
  }

  if (await hasActiveRelationship(personId, parentId, "parent")) {
    redirectWithRelationshipError(personId, "illegal_relationship");
  }

  if (
    (await hasActiveRelationship(personId, parentId, "spouse")) ||
    (await hasActiveRelationship(parentId, personId, "spouse"))
  ) {
    redirectWithRelationshipError(personId, "illegal_relationship");
  }

  const result = await insertRelationshipEdge({
    fromPersonId: parentId,
    toPersonId: personId,
    relationshipType: "parent",
    actorUserId: user.id
  });

  if (!result.ok) {
    redirectWithRelationshipError(personId, result.reason);
  }

  revalidateRelationshipPaths([personId, parentId]);
  redirectWithRelationshipStatus(personId, "added_parent");
}

export async function addChildRelationshipAction(formData: FormData) {
  const raw = toFormObject(formData);
  if (raw.person_id === raw.related_person_id) {
    const personId = typeof raw.person_id === "string" ? raw.person_id : "";
    redirectWithRelationshipError(personId, "self_link");
  }

  const parsed = addChildRelationshipSchema.safeParse(raw);
  if (!parsed.success) {
    const fallbackPersonId = typeof raw.person_id === "string" ? raw.person_id : "";
    redirectWithRelationshipError(fallbackPersonId, "invalid_relationship");
  }

  const personId = parsed.data.person_id;
  const childId = parsed.data.related_person_id;
  const { user } = await requireEditor(`/keluarga/${personId}`);

  const peopleCheck = await ensureActivePeople(personId, childId);
  if (!peopleCheck.ok) {
    redirectWithRelationshipError(personId, peopleCheck.reason);
  }

  if (await hasActiveRelationship(personId, childId, "parent")) {
    redirectWithRelationshipError(personId, "duplicate_relationship");
  }

  if (await hasActiveRelationship(childId, personId, "parent")) {
    redirectWithRelationshipError(personId, "illegal_relationship");
  }

  if (
    (await hasActiveRelationship(personId, childId, "spouse")) ||
    (await hasActiveRelationship(childId, personId, "spouse"))
  ) {
    redirectWithRelationshipError(personId, "illegal_relationship");
  }

  const result = await insertRelationshipEdge({
    fromPersonId: personId,
    toPersonId: childId,
    relationshipType: "parent",
    actorUserId: user.id
  });

  if (!result.ok) {
    redirectWithRelationshipError(personId, result.reason);
  }

  revalidateRelationshipPaths([personId, childId]);
  redirectWithRelationshipStatus(personId, "added_child");
}

export async function addSpouseRelationshipAction(formData: FormData) {
  const raw = toFormObject(formData);
  if (raw.person_id === raw.related_person_id) {
    const personId = typeof raw.person_id === "string" ? raw.person_id : "";
    redirectWithRelationshipError(personId, "self_link");
  }

  const parsed = addSpouseRelationshipSchema.safeParse(raw);
  if (!parsed.success) {
    const fallbackPersonId = typeof raw.person_id === "string" ? raw.person_id : "";
    redirectWithRelationshipError(fallbackPersonId, "invalid_relationship");
  }

  const personId = parsed.data.person_id;
  const relatedPersonId = parsed.data.related_person_id;
  const { user } = await requireEditor(`/keluarga/${personId}`);

  const peopleCheck = await ensureActivePeople(personId, relatedPersonId);
  if (!peopleCheck.ok) {
    redirectWithRelationshipError(personId, peopleCheck.reason);
  }

  const pair = normalizeSpousePair(personId, relatedPersonId);
  if (await hasActiveRelationship(pair.fromPersonId, pair.toPersonId, "spouse")) {
    redirectWithRelationshipError(personId, "duplicate_relationship");
  }

  if (
    (await hasActiveRelationship(pair.fromPersonId, pair.toPersonId, "parent")) ||
    (await hasActiveRelationship(pair.toPersonId, pair.fromPersonId, "parent"))
  ) {
    redirectWithRelationshipError(personId, "illegal_relationship");
  }

  if ((await hasAnyActiveSpouse(personId)) || (await hasAnyActiveSpouse(relatedPersonId))) {
    redirectWithRelationshipError(personId, "illegal_relationship");
  }

  const result = await insertRelationshipEdge({
    fromPersonId: pair.fromPersonId,
    toPersonId: pair.toPersonId,
    relationshipType: "spouse",
    actorUserId: user.id
  });

  if (!result.ok) {
    redirectWithRelationshipError(personId, result.reason);
  }

  revalidateRelationshipPaths([personId, relatedPersonId]);
  redirectWithRelationshipStatus(personId, "added_spouse");
}

export async function archiveRelationshipAction(formData: FormData) {
  const raw = toFormObject(formData);
  const parsed = archiveRelationshipSchema.safeParse(raw);
  if (!parsed.success) {
    const fallbackPersonId = typeof raw.person_id === "string" ? raw.person_id : "";
    redirectWithRelationshipError(fallbackPersonId, "invalid_relationship");
  }

  const personId = parsed.data.person_id;
  const { user } = await requireEditor(`/keluarga/${personId}`);
  const supabase = await createClient();
  const { data: relationship, error: relationshipError } = await supabase
    .from("relationships")
    .select("id, from_person_id, to_person_id, is_archived")
    .eq("id", parsed.data.relationship_id)
    .maybeSingle();

  if (relationshipError || !relationship) {
    redirectWithRelationshipError(personId, "invalid_relationship");
  }

  if (relationship.from_person_id !== personId && relationship.to_person_id !== personId) {
    redirectWithRelationshipError(personId, "invalid_relationship");
  }

  if (relationship.is_archived) {
    redirectWithRelationshipStatus(personId, "archived");
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
    redirectWithRelationshipError(personId, "archive_failed");
  }

  revalidateRelationshipPaths([relationship.from_person_id, relationship.to_person_id]);
  redirectWithRelationshipStatus(personId, "archived");
}
