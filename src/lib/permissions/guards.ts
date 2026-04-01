import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { normalizeRole, type AppRole, hasMinimumRole } from "@/lib/auth/roles";
import { isAuthBypassEnabled } from "@/lib/auth/bypass";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

async function getBypassAdminUserId() {
  const configuredUserId = process.env.AUTH_BYPASS_USER_ID?.trim();
  if (configuredUserId) {
    return configuredUserId;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin")
    .limit(1)
    .maybeSingle();

  if (error || !data?.user_id) {
    throw new Error(
      "ENABLE_AUTH_BYPASS=true but no admin user found. Set AUTH_BYPASS_USER_ID to an existing auth user."
    );
  }

  return data.user_id;
}

async function getBypassAdminUser(): Promise<User> {
  const userId = await getBypassAdminUserId();
  const nowIso = new Date().toISOString();
  const email = process.env.AUTH_BYPASS_EMAIL ?? "bypass-admin@kisah-keluarga.local";

  return {
    id: userId,
    app_metadata: {
      provider: "auth-bypass"
    },
    user_metadata: {
      bypass: true
    },
    aud: "authenticated",
    email,
    created_at: nowIso
  } as User;
}

async function getRoleByUserId(userId: string): Promise<AppRole> {
  if (isAuthBypassEnabled()) {
    return "admin";
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return "viewer";
  }

  const roleRow = data as { role?: unknown } | null;
  return normalizeRole(roleRow?.role);
}

export async function requireSignedIn(nextPath = "/"): Promise<User> {
  if (isAuthBypassEnabled()) {
    return getBypassAdminUser();
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}

export async function getCurrentUserRole(): Promise<AppRole> {
  if (isAuthBypassEnabled()) {
    return "admin";
  }

  const user = await requireSignedIn();
  return getRoleByUserId(user.id);
}

export async function requireRole(minimumRole: AppRole, nextPath = "/") {
  const user = await requireSignedIn(nextPath);
  const role = await getRoleByUserId(user.id);

  if (!hasMinimumRole(role, minimumRole)) {
    redirect("/?error=forbidden");
  }

  return { user, role };
}

export async function requireViewer(nextPath = "/") {
  return requireRole("viewer", nextPath);
}

export async function requireEditor(nextPath = "/") {
  return requireRole("editor", nextPath);
}

export async function requireAdmin(nextPath = "/admin") {
  return requireRole("admin", nextPath);
}
