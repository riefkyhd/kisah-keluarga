import { createClient } from "@/lib/supabase/server";
import {
  deriveRelationshipLabel,
  normalizeGenerationFilter,
  type GenerationFilterValue
} from "@/lib/people";
import { getMemberPhotoPublicUrl } from "@/lib/storage";

export type MemberListItem = {
  id: string;
  full_name: string;
  nickname: string | null;
  gender: string | null;
  birth_date: string | null;
  death_date: string | null;
  is_living: boolean;
  is_archived: boolean;
  profile_photo_path: string | null;
  profile_photo_url: string | null;
};

export type MemberProfile = MemberListItem & {
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export type DirectoryMemberListItem = MemberListItem & {
  generation: GenerationFilterValue;
  primary_relationship_label: string;
  child_count: number;
};

export type DirectoryMembersParams = {
  searchQuery?: string;
  generation?: string;
  page?: number;
  pageSize?: number;
};

export type DirectoryMembersResult = {
  members: DirectoryMemberListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  generationFilter: GenerationFilterValue | null;
};

type MemberWithPhotoPath = {
  id: string;
  gender: string | null;
  profile_photo_path: string | null;
};

type ActiveRelationshipRow = {
  from_person_id: string;
  to_person_id: string;
  relationship_type: "parent" | "spouse";
};

function normalizeDirectorySearchQuery(searchQuery?: string) {
  if (!searchQuery) {
    return "";
  }

  return searchQuery.trim().replace(/\s+/g, " ").slice(0, 80);
}

async function buildPublicPhotoUrlMap(paths: string[]) {
  const uniquePaths = Array.from(new Set(paths));
  const publicUrlMap = new Map<string, string>();
  uniquePaths.forEach((path) => {
    publicUrlMap.set(path, getMemberPhotoPublicUrl(path));
  });
  return publicUrlMap;
}

async function withPhotoUrls<T extends MemberWithPhotoPath>(rows: T[]) {
  const paths = rows
    .map((row) => row.profile_photo_path)
    .filter((path): path is string => Boolean(path));
  const publicUrlMap = await buildPublicPhotoUrlMap(paths);

  return rows.map((row) => ({
    ...row,
    profile_photo_url: row.profile_photo_path
      ? (publicUrlMap.get(row.profile_photo_path) ?? null)
      : null
  }));
}

export async function listActiveMembers(searchQuery?: string) {
  const normalizedSearchQuery = normalizeDirectorySearchQuery(searchQuery);
  const supabase = await createClient();
  let query = supabase
    .from("people")
    .select(
      "id, full_name, nickname, gender, birth_date, death_date, is_living, is_archived, profile_photo_path"
    )
    .eq("is_archived", false)
    .order("full_name", { ascending: true });

  if (normalizedSearchQuery) {
    const likePattern = `%${normalizedSearchQuery}%`;
    query = query.or(`full_name.ilike.${likePattern},nickname.ilike.${likePattern}`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Gagal memuat daftar anggota keluarga.");
  }

  const rows = (data ?? []) as Omit<MemberListItem, "profile_photo_url">[];
  return withPhotoUrls(rows);
}

function normalizePage(value?: number) {
  if (!value || Number.isNaN(value) || value < 1) {
    return 1;
  }

  return Math.floor(value);
}

function clampGeneration(value: number): GenerationFilterValue {
  if (value <= 1) {
    return 1;
  }

  if (value === 2) {
    return 2;
  }

  return 3;
}

async function getDirectoryRelationshipMeta(activePeopleIds: string[]) {
  const generationByPersonId = new Map<string, GenerationFilterValue>();
  const childCountByPersonId = new Map<string, number>();
  const hasParentSet = new Set<string>();
  const hasSpouseSet = new Set<string>();
  const generationMembers = new Map<GenerationFilterValue, string[]>([
    [1, []],
    [2, []],
    [3, []]
  ]);

  if (activePeopleIds.length === 0) {
    return {
      generationByPersonId,
      childCountByPersonId,
      hasParentSet,
      hasSpouseSet,
      generationMembers
    };
  }

  const activeSet = new Set(activePeopleIds);
  const parentsByChild = new Map<string, Set<string>>();
  const childrenByParent = new Map<string, Set<string>>();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("relationships")
    .select("from_person_id, to_person_id, relationship_type")
    .eq("is_archived", false);

  if (error) {
    throw new Error("Gagal memuat metadata relasi anggota.");
  }

  ((data ?? []) as ActiveRelationshipRow[]).forEach((row) => {
    if (!activeSet.has(row.from_person_id) || !activeSet.has(row.to_person_id)) {
      return;
    }

    if (row.relationship_type === "parent") {
      const children = childrenByParent.get(row.from_person_id) ?? new Set<string>();
      children.add(row.to_person_id);
      childrenByParent.set(row.from_person_id, children);

      const parents = parentsByChild.get(row.to_person_id) ?? new Set<string>();
      parents.add(row.from_person_id);
      parentsByChild.set(row.to_person_id, parents);

      hasParentSet.add(row.to_person_id);
      return;
    }

    if (row.relationship_type === "spouse") {
      hasSpouseSet.add(row.from_person_id);
      hasSpouseSet.add(row.to_person_id);
    }
  });

  activePeopleIds.forEach((personId) => {
    childCountByPersonId.set(personId, childrenByParent.get(personId)?.size ?? 0);
  });

  const roots = activePeopleIds.filter((personId) => (parentsByChild.get(personId)?.size ?? 0) === 0);
  const queue: Array<{ id: string; depth: number }> = [];
  const queueRoots = roots.length > 0 ? roots : activePeopleIds;
  queueRoots.forEach((id) => queue.push({ id, depth: 1 }));

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }

    const existingDepth = generationByPersonId.get(current.id);
    const clampedDepth = clampGeneration(current.depth);
    if (existingDepth !== undefined && existingDepth <= clampedDepth) {
      continue;
    }

    generationByPersonId.set(current.id, clampedDepth);
    const children = childrenByParent.get(current.id);
    if (!children) {
      continue;
    }

    children.forEach((childId) => {
      queue.push({ id: childId, depth: current.depth + 1 });
    });
  }

  activePeopleIds.forEach((personId) => {
    if (!generationByPersonId.has(personId)) {
      generationByPersonId.set(personId, 1);
    }

    const generation = generationByPersonId.get(personId) ?? 1;
    generationMembers.get(generation)?.push(personId);
  });

  return {
    generationByPersonId,
    childCountByPersonId,
    hasParentSet,
    hasSpouseSet,
    generationMembers
  };
}

export async function listDirectoryMembers({
  searchQuery,
  generation,
  page = 1,
  pageSize = 20
}: DirectoryMembersParams): Promise<DirectoryMembersResult> {
  const normalizedSearchQuery = normalizeDirectorySearchQuery(searchQuery);
  const normalizedPage = normalizePage(page);
  const safePageSize = pageSize > 0 ? Math.min(Math.floor(pageSize), 50) : 20;
  const generationFilter = normalizeGenerationFilter(generation);
  const supabase = await createClient();

  const { data: activePeopleRows, error: activePeopleError } = await supabase
    .from("people")
    .select("id")
    .eq("is_archived", false);

  if (activePeopleError) {
    throw new Error("Gagal memuat data anggota keluarga.");
  }

  const activePeopleIds = (activePeopleRows ?? []).map((row) => String(row.id));
  const {
    generationByPersonId,
    childCountByPersonId,
    hasParentSet,
    hasSpouseSet,
    generationMembers
  } = await getDirectoryRelationshipMeta(activePeopleIds);

  const filteredGenerationIds = generationFilter ? generationMembers.get(generationFilter) ?? [] : null;
  if (generationFilter && filteredGenerationIds && filteredGenerationIds.length === 0) {
    return {
      members: [],
      totalCount: 0,
      page: 1,
      pageSize: safePageSize,
      totalPages: 1,
      generationFilter
    };
  }

  let query = supabase
    .from("people")
    .select(
      "id, full_name, nickname, gender, birth_date, death_date, is_living, is_archived, profile_photo_path",
      { count: "exact" }
    )
    .eq("is_archived", false)
    .order("full_name", { ascending: true });

  if (normalizedSearchQuery) {
    const likePattern = `%${normalizedSearchQuery}%`;
    query = query.or(`full_name.ilike.${likePattern},nickname.ilike.${likePattern}`);
  }

  if (filteredGenerationIds) {
    query = query.in("id", filteredGenerationIds);
  }

  const from = (normalizedPage - 1) * safePageSize;
  const to = from + safePageSize - 1;
  const { data, count, error } = await query.range(from, to);

  if (error) {
    throw new Error("Gagal memuat daftar anggota keluarga.");
  }

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
  const safePage = Math.min(normalizedPage, totalPages);
  if (safePage !== normalizedPage) {
    return listDirectoryMembers({
      searchQuery: normalizedSearchQuery,
      generation: generationFilter ? String(generationFilter) : undefined,
      page: safePage,
      pageSize: safePageSize
    });
  }

  const rows = (data ?? []) as Omit<MemberListItem, "profile_photo_url">[];
  const withPhotoRows = await withPhotoUrls(rows);
  const members = withPhotoRows.map((row) => {
    const childCount = childCountByPersonId.get(row.id) ?? 0;
    const hasParent = hasParentSet.has(row.id);
    const hasSpouse = hasSpouseSet.has(row.id);

    return {
      ...row,
      generation: generationByPersonId.get(row.id) ?? 1,
      child_count: childCount,
      primary_relationship_label: deriveRelationshipLabel({
        gender: row.gender,
        hasParent,
        hasSpouse,
        childCount
      })
    } satisfies DirectoryMemberListItem;
  });

  return {
    members,
    totalCount,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
    generationFilter
  };
}

export async function getMemberById(personId: string, includeArchived = false) {
  const supabase = await createClient();
  let query = supabase
    .from("people")
    .select(
      "id, full_name, nickname, gender, birth_date, death_date, bio, is_living, is_archived, profile_photo_path, created_at, updated_at"
    )
    .eq("id", personId);

  if (!includeArchived) {
    query = query.eq("is_archived", false);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error("Gagal memuat profil anggota.");
  }

  if (!data) {
    return null;
  }

  const rows = await withPhotoUrls([data as Omit<MemberProfile, "profile_photo_url">]);
  return rows[0] as MemberProfile;
}
