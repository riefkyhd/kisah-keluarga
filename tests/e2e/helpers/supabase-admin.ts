import { createClient } from "@supabase/supabase-js";

export type AppRole = "viewer" | "contributor" | "editor" | "admin";

type TestUser = {
  id: string;
  email: string;
  role: AppRole;
};

type TestMember = {
  id: string;
  full_name: string;
};

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
  let user = await findUserByEmail(email);

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: `${role}-E2E-Temp-123!`,
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

  const { error: roleError } = await admin
    .from("user_roles")
    .upsert({ user_id: user.id, role }, { onConflict: "user_id" });

  if (roleError) {
    throw new Error(`Gagal upsert role test user ${email}: ${roleError.message}`);
  }

  return {
    id: user.id,
    email,
    role
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

export async function createMemberFixture(label: string, createdByUserId?: string): Promise<TestMember> {
  const admin = getAdminClient();
  const fullName = `${label} ${Date.now()}-${Math.floor(Math.random() * 10_000)}`;

  const { data, error } = await admin
    .from("people")
    .insert({
      full_name: fullName,
      is_living: true,
      is_archived: false,
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
