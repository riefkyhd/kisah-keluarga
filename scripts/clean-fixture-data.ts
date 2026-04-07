import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const FIXTURE_PREFIXES = [
  "[TEST]",
  "Photo Flow",
  "Photo Invalid",
  "Photo Large",
  "Photo Viewer",
] as const;
const PHOTO_BUCKET = "member-photos";

type MatchRow = {
  id: string;
  full_name: string;
  profile_photo_path: string | null;
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

async function listStoragePathsByMemberFolder(supabase: any, personId: string) {
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

async function main() {
  const execute = hasFlag("--execute");
  const dryRun = !execute || hasFlag("--dry-run");

  const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const orExpression = FIXTURE_PREFIXES.map((prefix) => `full_name.ilike.${prefix}%`).join(",");
  const { data, error } = await supabase
    .from("people")
    .select("id, full_name, profile_photo_path, created_at")
    .or(orExpression)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Gagal membaca fixture people: ${error.message}`);
  }

  const matches = (data ?? []) as MatchRow[];
  console.log(`[info] mode: ${dryRun ? "dry-run" : "execute"}`);
  console.log(`[info] fixture match count: ${matches.length}`);

  if (matches.length === 0) {
    console.log("[done] tidak ada fixture yang cocok.");
    return;
  }

  matches.forEach((row) => {
    console.log(`- ${row.id} | ${row.full_name} | created_at=${row.created_at}`);
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
    folderPaths.forEach((path: string) => storagePathSet.add(path));
  }

  const storagePaths = Array.from(storagePathSet);
  console.log(`[info] related storage objects: ${storagePaths.length}`);
  if (storagePaths.length > 0) {
    storagePaths.forEach((path) => {
      console.log(`  storage: ${path}`);
    });
  }

  if (dryRun) {
    console.log("[done] dry-run selesai. Tambahkan --execute untuk menghapus data.");
    return;
  }

  if (storagePaths.length > 0) {
    for (const group of chunk(storagePaths, 100)) {
      const { error: removeError } = await supabase.storage.from(PHOTO_BUCKET).remove(group);
      if (removeError) {
        throw new Error(`Gagal menghapus storage object: ${removeError.message}`);
      }
    }
  }

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

  const { error: peopleError } = await supabase.from("people").delete().in("id", personIds);
  if (peopleError) {
    throw new Error(`Gagal menghapus fixture people: ${peopleError.message}`);
  }

  console.log("[done] fixture people + relasi + stories + storage berhasil dihapus.");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[error] ${message}`);
  process.exit(1);
});
