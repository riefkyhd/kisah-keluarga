import { createClient } from "@/lib/supabase/server";

const MEMBER_PHOTO_BUCKET = "member-photos";
const SIGNED_PHOTO_URL_TTL_SECONDS = 1800;

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

type MemberWithPhotoPath = {
  profile_photo_path: string | null;
};

function normalizeDirectorySearchQuery(searchQuery?: string) {
  if (!searchQuery) {
    return "";
  }

  return searchQuery.trim().replace(/\s+/g, " ").slice(0, 80);
}

async function buildSignedPhotoUrlMap(paths: string[]) {
  if (paths.length === 0) {
    return new Map<string, string>();
  }

  const uniquePaths = Array.from(new Set(paths));
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(MEMBER_PHOTO_BUCKET)
    .createSignedUrls(uniquePaths, SIGNED_PHOTO_URL_TTL_SECONDS);

  if (error || !data) {
    return new Map<string, string>();
  }

  const signedUrlMap = new Map<string, string>();
  data.forEach((item) => {
    if (item.path && item.signedUrl) {
      signedUrlMap.set(item.path, item.signedUrl);
    }
  });
  return signedUrlMap;
}

async function withPhotoUrls<T extends MemberWithPhotoPath>(rows: T[]) {
  const paths = rows
    .map((row) => row.profile_photo_path)
    .filter((path): path is string => Boolean(path));
  const signedUrlMap = await buildSignedPhotoUrlMap(paths);

  return rows.map((row) => ({
    ...row,
    profile_photo_url: row.profile_photo_path
      ? (signedUrlMap.get(row.profile_photo_path) ?? null)
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
