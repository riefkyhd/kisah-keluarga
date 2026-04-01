import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

export type AppRole = "viewer" | "contributor" | "editor" | "admin";

type TestUser = {
  id: string;
  email: string;
  role: AppRole;
  password: string;
};

type TestMember = {
  id: string;
  full_name: string;
};

type CreateMemberFixtureOptions = {
  nickname?: string | null;
  isArchived?: boolean;
  isLiving?: boolean;
};

type RelationshipType = "parent" | "spouse";

type TestRelationship = {
  id: string;
  from_person_id: string;
  to_person_id: string;
  relationship_type: RelationshipType;
};

type TestStory = {
  id: string;
  person_id: string;
  title: string;
  is_archived: boolean;
};

type CreateStoryFixtureOptions = {
  eventDate?: string | null;
  isArchived?: boolean;
  body?: string;
};

type TestUploadFile = {
  name: string;
  mimeType: string;
  buffer: Buffer;
};

type MemberPhotoStorageMeta = {
  path: string;
  mimetype: string | null;
  size: number | null;
};

const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7ZJwAAAABJRU5ErkJggg==";

function assertTestBootstrapEnabled() {
  if (process.env.ENABLE_TEST_AUTH_BOOTSTRAP !== "true") {
    throw new Error(
      "ENABLE_TEST_AUTH_BOOTSTRAP=true wajib diaktifkan untuk helper auth testing."
    );
  }
}

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Env ${name} wajib diisi untuk menjalankan E2E.`);
  }

  return value;
}

function getBaseUrl() {
  return process.env.PLAYWRIGHT_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000";
}

function getAdminClient() {
  assertTestBootstrapEnabled();
  const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function getRoleEmail(role: AppRole) {
  return `e2e.${role}@kisah-keluarga.local`;
}

function getRolePassword(role: AppRole) {
  return `${role}-E2E-Temp-123!`;
}

async function findUserByEmail(email: string) {
  const admin = getAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 500
  });

  if (error) {
    throw new Error(`Gagal membaca daftar user test: ${error.message}`);
  }

  return data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function ensureRoleUser(role: AppRole): Promise<TestUser> {
  const admin = getAdminClient();
  const email = getRoleEmail(role);
  const password = getRolePassword(role);
  let user = await findUserByEmail(email);

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        testing: true,
        role
      }
    });

    if (error && !error.message.toLowerCase().includes("already")) {
      throw new Error(`Gagal membuat user test ${email}: ${error.message}`);
    }

    user = data?.user ?? (await findUserByEmail(email));
  }

  if (!user) {
    throw new Error(`User test ${email} tidak ditemukan setelah bootstrap.`);
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
    password,
    email_confirm: true,
    ban_duration: "none"
  });

  if (updateError) {
    throw new Error(`Gagal sinkron password test user ${email}: ${updateError.message}`);
  }

  const { error: roleError } = await admin
    .from("user_roles")
    .upsert({ user_id: user.id, role }, { onConflict: "user_id" });

  if (roleError) {
    throw new Error(`Gagal upsert role test user ${email}: ${roleError.message}`);
  }

  return {
    id: user.id,
    email,
    role,
    password
  };
}

export async function getPasswordCredentialsForRole(role: AppRole) {
  const user = await ensureRoleUser(role);
  return {
    email: user.email,
    password: user.password
  };
}

export async function getMagicLinkForRole(role: AppRole, nextPath = "/keluarga") {
  const admin = getAdminClient();
  const user = await ensureRoleUser(role);
  const redirectTo = new URL("/callback", getBaseUrl());
  redirectTo.searchParams.set("next", nextPath);

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: user.email,
    options: {
      redirectTo: redirectTo.toString()
    }
  });

  if (error) {
    throw new Error(`Gagal membuat magic link test untuk ${user.email}: ${error.message}`);
  }

  const tokenHash = data?.properties?.hashed_token;
  const otpType = data?.properties?.verification_type;

  if (tokenHash && otpType) {
    const callbackUrl = new URL("/callback", getBaseUrl());
    callbackUrl.searchParams.set("next", nextPath);
    callbackUrl.searchParams.set("token_hash", tokenHash);
    callbackUrl.searchParams.set("type", otpType);
    return callbackUrl.toString();
  }

  const actionLink = data?.properties?.action_link ?? (data as { action_link?: string } | null)?.action_link;
  if (!actionLink || actionLink.startsWith("http") === false) {
    throw new Error("Magic link test tidak valid. Periksa konfigurasi Supabase Auth redirect URL.");
  }

  return actionLink;
}

export async function createMemberFixture(
  label: string,
  createdByUserId?: string,
  options: CreateMemberFixtureOptions = {}
): Promise<TestMember> {
  const admin = getAdminClient();
  const normalizedLabel = label.trim().replace(/\s+/g, " ");
  const fullNameBase = normalizedLabel.startsWith("[TEST]") ? normalizedLabel : `[TEST] ${normalizedLabel}`;
  const fullName = `${fullNameBase} ${Date.now()}-${Math.floor(Math.random() * 10_000)}`;

  const { data, error } = await admin
    .from("people")
    .insert({
      full_name: fullName,
      nickname: options.nickname ?? null,
      is_living: options.isLiving ?? true,
      is_archived: options.isArchived ?? false,
      created_by: createdByUserId ?? null,
      updated_by: createdByUserId ?? null
    })
    .select("id, full_name")
    .single();

  if (error || !data) {
    throw new Error(`Gagal membuat member fixture: ${error?.message ?? "unknown error"}`);
  }

  return data as TestMember;
}

function normalizeSpousePair(fromPersonId: string, toPersonId: string) {
  return fromPersonId < toPersonId
    ? { fromPersonId, toPersonId }
    : { fromPersonId: toPersonId, toPersonId: fromPersonId };
}

export async function createRelationshipFixture(params: {
  fromPersonId: string;
  toPersonId: string;
  relationshipType: RelationshipType;
  createdByUserId?: string;
}): Promise<TestRelationship> {
  const admin = getAdminClient();

  const normalized =
    params.relationshipType === "spouse"
      ? normalizeSpousePair(params.fromPersonId, params.toPersonId)
      : { fromPersonId: params.fromPersonId, toPersonId: params.toPersonId };

  const { data, error } = await admin
    .from("relationships")
    .insert({
      from_person_id: normalized.fromPersonId,
      to_person_id: normalized.toPersonId,
      relationship_type: params.relationshipType,
      is_archived: false,
      created_by: params.createdByUserId ?? null,
      updated_by: params.createdByUserId ?? null
    })
    .select("id, from_person_id, to_person_id, relationship_type")
    .single();

  if (error || !data) {
    throw new Error(`Gagal membuat relationship fixture: ${error?.message ?? "unknown error"}`);
  }

  return data as TestRelationship;
}

export async function createStoryFixture(
  label: string,
  personId: string,
  createdByUserId?: string,
  options: CreateStoryFixtureOptions = {}
): Promise<TestStory> {
  const admin = getAdminClient();
  const title = `${label} ${Date.now()}-${Math.floor(Math.random() * 10_000)}`;

  const { data, error } = await admin
    .from("stories")
    .insert({
      person_id: personId,
      title,
      body:
        options.body ??
        "Cerita fixture untuk pengujian otomatis timeline keluarga.",
      event_date: options.eventDate ?? null,
      is_archived: options.isArchived ?? false,
      created_by: createdByUserId ?? null,
      updated_by: createdByUserId ?? null
    })
    .select("id, person_id, title, is_archived")
    .single();

  if (error || !data) {
    throw new Error(`Gagal membuat story fixture: ${error?.message ?? "unknown error"}`);
  }

  return data as TestStory;
}

export function createTinyPngUpload(name = "photo.png"): TestUploadFile {
  return {
    name,
    mimeType: "image/png",
    buffer: Buffer.from(TINY_PNG_BASE64, "base64")
  };
}

export function createInvalidUpload(name = "invalid.txt"): TestUploadFile {
  return {
    name,
    mimeType: "text/plain",
    buffer: Buffer.from("not-an-image", "utf-8")
  };
}

export async function createLargeJpegUpload(name = "gallery-large.jpg"): Promise<TestUploadFile> {
  const width = 2200;
  const height = 1600;
  const channels = 3;
  const raw = Buffer.alloc(width * height * channels);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * channels;
      raw[index] = (x + y) % 256;
      raw[index + 1] = (x * 3 + y * 5) % 256;
      raw[index + 2] = (x * 7 + y * 11) % 256;
    }
  }

  let quality = 94;
  let jpeg = await sharp(raw, { raw: { width, height, channels } })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();

  while (jpeg.length > 3_900_000 && quality > 70) {
    quality -= 6;
    jpeg = await sharp(raw, { raw: { width, height, channels } })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
  }

  return {
    name,
    mimeType: "image/jpeg",
    buffer: jpeg
  };
}

export async function attachPhotoFixtureToMember(personId: string, createdByUserId?: string) {
  const admin = getAdminClient();
  const file = createTinyPngUpload(`fixture-${Date.now()}.png`);
  const photoPath = `members/${personId}/fixture-${Date.now()}.png`;

  const { error: uploadError } = await admin.storage
    .from("member-photos")
    .upload(photoPath, file.buffer, {
      contentType: file.mimeType,
      upsert: true
    });

  if (uploadError) {
    throw new Error(`Gagal upload foto fixture: ${uploadError.message}`);
  }

  const { error: updateError } = await admin
    .from("people")
    .update({
      profile_photo_path: photoPath,
      updated_by: createdByUserId ?? null,
      updated_at: new Date().toISOString()
    })
    .eq("id", personId);

  if (updateError) {
    throw new Error(`Gagal memasang foto fixture ke member: ${updateError.message}`);
  }

  return photoPath;
}

export async function getMemberPhotoStorageMeta(personId: string): Promise<MemberPhotoStorageMeta | null> {
  const admin = getAdminClient();
  const { data: member, error: memberError } = await admin
    .from("people")
    .select("profile_photo_path")
    .eq("id", personId)
    .maybeSingle();

  if (memberError || !member) {
    throw new Error(
      `Gagal membaca profile_photo_path member ${personId}: ${memberError?.message ?? "member tidak ditemukan"}`
    );
  }

  const photoPath = (member as { profile_photo_path: string | null }).profile_photo_path;
  if (!photoPath) {
    return null;
  }

  const segments = photoPath.split("/");
  const fileName = segments.pop();
  const folderPath = segments.join("/");
  if (!fileName || !folderPath) {
    throw new Error(`Path foto tidak valid: ${photoPath}`);
  }

  const { data: objectRows, error: objectError } = await admin.storage
    .from("member-photos")
    .list(folderPath, {
      limit: 100,
      search: fileName
    });

  if (objectError || !objectRows) {
    throw new Error(
      `Gagal membaca metadata object foto ${photoPath}: ${objectError?.message ?? "gagal list object"}`
    );
  }

  const objectRow = objectRows.find((row) => row.name === fileName);
  if (!objectRow) {
    throw new Error(`Object foto ${photoPath} tidak ditemukan di bucket member-photos.`);
  }

  const metadata = objectRow.metadata as unknown;
  const metadataRecord =
    metadata && typeof metadata === "object" ? (metadata as Record<string, unknown>) : {};
  const size = metadataRecord.size;

  return {
    path: photoPath,
    mimetype: typeof metadataRecord.mimetype === "string" ? metadataRecord.mimetype : null,
    size: typeof size === "number" ? size : null
  };
}
