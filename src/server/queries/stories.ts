import { createClient } from "@/lib/supabase/server";

export type StoryListItem = {
  id: string;
  person_id: string;
  person_full_name: string;
  title: string;
  body: string;
  event_date: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

export type StoryCandidateMember = {
  id: string;
  full_name: string;
};

type StoryPersonJoin =
  | {
      full_name: string;
      is_archived: boolean;
    }
  | {
      full_name: string;
      is_archived: boolean;
    }[]
  | null;

type StoryRow = {
  id: string;
  person_id: string;
  title: string;
  body: string;
  event_date: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  person: StoryPersonJoin;
};

function extractJoinedPerson(person: StoryPersonJoin) {
  if (!person) {
    return null;
  }

  if (Array.isArray(person)) {
    return person[0] ?? null;
  }

  return person;
}

function sortByTimelineDate<T extends { event_date: string | null; created_at: string }>(rows: T[]) {
  return [...rows].sort((a, b) => {
    if (a.event_date && b.event_date) {
      if (a.event_date !== b.event_date) {
        return b.event_date.localeCompare(a.event_date);
      }
    } else if (a.event_date && !b.event_date) {
      return -1;
    } else if (!a.event_date && b.event_date) {
      return 1;
    }

    return b.created_at.localeCompare(a.created_at);
  });
}

function mapStoryRowToStoryListItem(
  row: StoryRow,
  options?: {
    excludeArchivedPeople?: boolean;
  }
) {
  const person = extractJoinedPerson(row.person);

  if (!person) {
    return null;
  }

  if (options?.excludeArchivedPeople && person.is_archived) {
    return null;
  }

  return {
    id: row.id,
    person_id: row.person_id,
    person_full_name: person.full_name,
    title: row.title,
    body: row.body,
    event_date: row.event_date,
    is_archived: row.is_archived,
    created_at: row.created_at,
    updated_at: row.updated_at
  } as StoryListItem;
}

export async function listTimelineStories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stories")
    .select(
      "id, person_id, title, body, event_date, is_archived, created_at, updated_at, person:people!stories_person_id_fkey(full_name, is_archived)"
    )
    .eq("is_archived", false)
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Gagal memuat timeline keluarga.");
  }

  const mappedStories = (data ?? [])
    .map((row) => mapStoryRowToStoryListItem(row as StoryRow, { excludeArchivedPeople: true }))
    .filter((row): row is StoryListItem => row !== null);

  return mappedStories.filter((row) => row.is_archived === false);
}

export async function getStoryById(
  storyId: string,
  includeArchivedStories = false,
  includeArchivedPeople = false
) {
  const supabase = await createClient();
  let query = supabase
    .from("stories")
    .select(
      "id, person_id, title, body, event_date, is_archived, created_at, updated_at, person:people!stories_person_id_fkey(full_name, is_archived)"
    )
    .eq("id", storyId);

  if (!includeArchivedStories) {
    query = query.eq("is_archived", false);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error("Gagal memuat cerita keluarga.");
  }

  if (!data) {
    return null;
  }

  const mapped = mapStoryRowToStoryListItem(data as StoryRow);
  if (!mapped) {
    return null;
  }

  const person = extractJoinedPerson((data as StoryRow).person);
  if (!person) {
    return null;
  }

  if (!includeArchivedPeople && person.is_archived) {
    return null;
  }

  return mapped;
}

export async function listStoriesByPersonId(personId: string, includeArchivedStories = false) {
  const supabase = await createClient();
  let query = supabase
    .from("stories")
    .select(
      "id, person_id, title, body, event_date, is_archived, created_at, updated_at, person:people!stories_person_id_fkey(full_name, is_archived)"
    )
    .eq("person_id", personId)
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (!includeArchivedStories) {
    query = query.eq("is_archived", false);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Gagal memuat cerita terkait anggota.");
  }

  const stories = (data ?? [])
    .map((row) => mapStoryRowToStoryListItem(row as StoryRow))
    .filter((row): row is StoryListItem => row !== null)
    .filter((row) => row.is_archived === false || includeArchivedStories);

  return sortByTimelineDate(stories);
}

export async function listStoryMemberCandidates() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("people")
    .select("id, full_name")
    .eq("is_archived", false)
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error("Gagal memuat kandidat anggota untuk cerita.");
  }

  return (data ?? []) as StoryCandidateMember[];
}
