import { createClient } from "@/lib/supabase/server";

export type MemberListItem = {
  id: string;
  full_name: string;
  nickname: string | null;
  gender: string | null;
  birth_date: string | null;
  death_date: string | null;
  is_living: boolean;
  is_archived: boolean;
};

export type MemberProfile = MemberListItem & {
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export async function listActiveMembers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("people")
    .select("id, full_name, nickname, gender, birth_date, death_date, is_living, is_archived")
    .eq("is_archived", false)
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error("Gagal memuat daftar anggota keluarga.");
  }

  return (data ?? []) as MemberListItem[];
}

export async function getMemberById(personId: string, includeArchived = false) {
  const supabase = await createClient();
  let query = supabase
    .from("people")
    .select(
      "id, full_name, nickname, gender, birth_date, death_date, bio, is_living, is_archived, created_at, updated_at"
    )
    .eq("id", personId);

  if (!includeArchived) {
    query = query.eq("is_archived", false);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error("Gagal memuat profil anggota.");
  }

  return (data ?? null) as MemberProfile | null;
}
