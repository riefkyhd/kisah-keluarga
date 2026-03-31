import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { normalizeRole, type AppRole, hasMinimumRole } from "@/lib/auth/roles";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

async function getRoleByUserId(userId: string): Promise<AppRole> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return "viewer";
  }

  return normalizeRole(data?.role);
}

export async function requireSignedIn(nextPath = "/"): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}

export async function getCurrentUserRole(): Promise<AppRole> {
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
