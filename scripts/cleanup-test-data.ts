import nextEnv from "@next/env";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const PHOTO_BUCKET = "member-photos";
const FIXTURE_MARKERS = ["[TEST]", "Photo Flow", "Photo Invalid", "Photo Viewer", "Photo Large"] as const;
const PAGE_SIZE = 1000;

type MatchRow = {
  id: string;
  full_name: string;
  profile_photo_path: string | null;
  is_archived: boolean;
  created_at: string;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Env ${name} wajib diisi.`);
  }

  return value;
}

function hasFlag(flag: string) {
  return process.argv.includes(flag);
}

function chunk<T>(items: T[], size: number) {
  const output: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    output.push(items.slice(index, index + size));
  }
  return output;
}

function isFixtureName(fullName: string) {
  const normalized = fullName.trim().toLowerCase();
  return FIXTURE_MARKERS.some((marker) => normalized.includes(marker.toLowerCase()));
}

async function listPeopleRows(supabase: SupabaseClient) {
  const rows: MatchRow[] = [];
  for (let page = 0; ; page += 1) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("people")
      .select("id, full_name, profile_photo_path, is_archived, created_at")
      .order("created_at", { ascending: true })
      .range(from, to);

    if (error) {
      throw new Error(`Gagal membaca people rows: ${error.message}`);
    }

    const batch = (data ?? []) as MatchRow[];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) {
      break;
    }
  }

  return rows;
}

async function listStoragePathsByMemberFolder(
  supabase: SupabaseClient,
  personId: string
) {
  const prefix = `members/${personId}`;
  const { data, error } = await supabase.storage.from(PHOTO_BUCKET).list(prefix, { limit: 1000 });
  if (error || !data) {
    console.warn(`[warn] gagal list storage ${prefix}: ${error?.message ?? "unknown error"}`);
    return [] as string[];
  }

  return data
    .filter((item: { name?: string }) => Boolean(item.name))
    .map((item: { name: string }) => `${prefix}/${item.name}`);
}

async function removeStorageObjects(
  supabase: SupabaseClient,
  storagePaths: string[]
) {
  if (storagePaths.length === 0) {
    return;
  }

  for (const group of chunk(storagePaths, 100)) {
    const { error } = await supabase.storage.from(PHOTO_BUCKET).remove(group);
    if (error) {
      throw new Error(`Gagal menghapus storage object: ${error.message}`);
    }
  }
}

async function main() {
  const confirm = hasFlag("--confirm");
  const hardDelete = hasFlag("--hard");

  const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const allPeople = await listPeopleRows(supabase);
  const matches = allPeople.filter((row) => isFixtureName(row.full_name));

  console.log(`[info] mode: ${confirm ? (hardDelete ? "execute-hard-delete" : "execute-soft-archive") : "dry-run"}`);
  console.log(`[info] fixture match count: ${matches.length}`);

  if (matches.length === 0) {
    console.log("[done] tidak ada data fixture yang cocok.");
    return;
  }

  matches.forEach((row) => {
    console.log(
      `- ${row.id} | ${row.full_name} | archived=${row.is_archived ? "true" : "false"} | created_at=${row.created_at}`
    );
  });

  const personIds = matches.map((row) => row.id);
  const storagePathSet = new Set<string>();

  matches.forEach((row) => {
    if (row.profile_photo_path) {
      storagePathSet.add(row.profile_photo_path);
    }
  });

  for (const personId of personIds) {
    const folderPaths = await listStoragePathsByMemberFolder(supabase, personId);
    folderPaths.forEach((path) => storagePathSet.add(path));
  }

  const storagePaths = Array.from(storagePathSet);
  console.log(`[info] related storage objects: ${storagePaths.length}`);
  storagePaths.forEach((path) => {
    console.log(`  storage: ${path}`);
  });

  if (!confirm) {
    console.log("[done] dry-run selesai. Jalankan dengan --confirm untuk eksekusi nyata.");
    return;
  }

  await removeStorageObjects(supabase, storagePaths);

  if (hardDelete) {
    const { error: relFromError } = await supabase
      .from("relationships")
      .delete()
      .in("from_person_id", personIds);
    if (relFromError) {
      throw new Error(`Gagal menghapus relationships (from_person_id): ${relFromError.message}`);
    }

    const { error: relToError } = await supabase
      .from("relationships")
      .delete()
      .in("to_person_id", personIds);
    if (relToError) {
      throw new Error(`Gagal menghapus relationships (to_person_id): ${relToError.message}`);
    }

    const { error: storiesError } = await supabase.from("stories").delete().in("person_id", personIds);
    if (storiesError) {
      throw new Error(`Gagal menghapus stories terkait fixture: ${storiesError.message}`);
    }

    const { error: peopleDeleteError } = await supabase.from("people").delete().in("id", personIds);
    if (peopleDeleteError) {
      throw new Error(`Gagal hard-delete fixture people: ${peopleDeleteError.message}`);
    }

    console.log("[done] hard-delete fixture berhasil (people + relationships + stories + storage).");
    return;
  }

  const { error: peopleArchiveError } = await supabase
    .from("people")
    .update({ is_archived: true, profile_photo_path: null })
    .in("id", personIds);
  if (peopleArchiveError) {
    throw new Error(`Gagal mengarsipkan fixture people: ${peopleArchiveError.message}`);
  }

  console.log("[done] fixture people diarsipkan + foto storage terkait dihapus.");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[error] ${message}`);
  process.exit(1);
});
