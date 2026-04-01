#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getArgValue(flag) {
  const index = process.argv.indexOf(flag);
  if (index < 0) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Env ${name} wajib diisi.`);
  }

  return value;
}

function readInputs() {
  const email = (getArgValue("--email") ?? process.env.BOOTSTRAP_ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = getArgValue("--password") ?? process.env.BOOTSTRAP_ADMIN_PASSWORD ?? "";

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error("Email bootstrap admin tidak valid.");
  }

  if (password.length < 8) {
    throw new Error("Password bootstrap admin minimal 8 karakter.");
  }

  return { email, password };
}

function createAdminClient() {
  const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function findUserByEmail(adminClient, email) {
  const { data, error } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 500
  });

  if (error) {
    throw new Error(`Gagal membaca daftar user auth: ${error.message}`);
  }

  return data.users.find((user) => user.email?.toLowerCase() === email) ?? null;
}

async function ensureAdminUser(adminClient, email, password) {
  let user = await findUserByEmail(adminClient, email);

  if (!user) {
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        bootstrap_admin: true
      }
    });

    if (error || !data.user) {
      throw new Error(`Gagal membuat user admin bootstrap: ${error?.message ?? "unknown error"}`);
    }

    user = data.user;
  } else {
    const { data, error } = await adminClient.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      ban_duration: "none"
    });

    if (error || !data.user) {
      throw new Error(`Gagal memperbarui user admin bootstrap: ${error?.message ?? "unknown error"}`);
    }

    user = data.user;
  }

  return user;
}

async function ensureAdminRole(adminClient, userId) {
  const { error } = await adminClient
    .from("user_roles")
    .upsert(
      {
        user_id: userId,
        role: "admin"
      },
      { onConflict: "user_id" }
    );

  if (error) {
    throw new Error(`Gagal upsert role admin: ${error.message}`);
  }
}

async function main() {
  const { email, password } = readInputs();
  const adminClient = createAdminClient();
  const user = await ensureAdminUser(adminClient, email, password);
  await ensureAdminRole(adminClient, user.id);

  console.log("Bootstrap admin selesai.");
  console.log(`User ID: ${user.id}`);
  console.log(`Email  : ${email}`);
}

main().catch((error) => {
  console.error("Bootstrap admin gagal.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
