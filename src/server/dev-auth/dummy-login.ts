import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { AppRole } from "@/lib/auth/roles";
import { sanitizeInternalNextPath } from "./config";

const DUMMY_ROLES = ["viewer", "editor", "admin"] as const;

type DummyRole = (typeof DUMMY_ROLES)[number];

type DummyRoleUser = {
  id: string;
  email: string;
  role: DummyRole;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Env ${name} wajib diisi untuk dev dummy login.`);
  }

  return value;
}

function getAdminClient() {
  const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function getDummyEmailByRole(role: DummyRole) {
  return `dev.${role}@kisah-keluarga.local`;
}

async function findUserByEmail(email: string) {
  const admin = getAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 500
  });

  if (error) {
    throw new Error(`Gagal membaca user untuk dev dummy login: ${error.message}`);
  }

  return data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

export function isDummyRole(value: string): value is DummyRole {
  return DUMMY_ROLES.includes(value as DummyRole);
}

export async function ensureRoleUser(role: DummyRole): Promise<DummyRoleUser> {
  const admin = getAdminClient();
  const email = getDummyEmailByRole(role);
  let user = await findUserByEmail(email);

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: `dev-${role}-Temp-123!`,
      email_confirm: true,
      user_metadata: {
        dev_dummy_login: true,
        role
      }
    });

    if (error && !error.message.toLowerCase().includes("already")) {
      throw new Error(`Gagal membuat user dummy ${email}: ${error.message}`);
    }

    user = data?.user ?? (await findUserByEmail(email));
  }

  if (!user) {
    throw new Error(`User dummy ${email} tidak ditemukan setelah bootstrap.`);
  }

  const { error: roleError } = await admin
    .from("user_roles")
    .upsert({ user_id: user.id, role: role as AppRole }, { onConflict: "user_id" });

  if (roleError) {
    throw new Error(`Gagal sinkron role user dummy ${email}: ${roleError.message}`);
  }

  return {
    id: user.id,
    email,
    role
  };
}

export async function generateRoleLoginLink(
  role: DummyRole,
  nextPathRaw: string | null | undefined,
  requestOrigin: string
) {
  const admin = getAdminClient();
  const user = await ensureRoleUser(role);
  const nextPath = sanitizeInternalNextPath(nextPathRaw);

  const redirectTo = new URL("/callback", requestOrigin);
  redirectTo.searchParams.set("next", nextPath);

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: user.email,
    options: {
      redirectTo: redirectTo.toString()
    }
  });

  if (error) {
    throw new Error(`Gagal membuat login link dummy ${user.email}: ${error.message}`);
  }

  const tokenHash = data?.properties?.hashed_token;
  const otpType = data?.properties?.verification_type;

  if (tokenHash && otpType) {
    const callbackUrl = new URL("/callback", requestOrigin);
    callbackUrl.searchParams.set("next", nextPath);
    callbackUrl.searchParams.set("token_hash", tokenHash);
    callbackUrl.searchParams.set("type", otpType);
    return callbackUrl.toString();
  }

  const actionLink = data?.properties?.action_link ?? (data as { action_link?: string } | null)?.action_link;
  if (!actionLink || actionLink.startsWith("http") === false) {
    throw new Error("Login link dummy tidak valid.");
  }

  return actionLink;
}
