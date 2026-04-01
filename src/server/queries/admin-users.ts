import "server-only";

import { normalizeRole, type AppRole } from "@/lib/auth/roles";
import { requireAdmin } from "@/lib/permissions/guards";
import { createAuthAdminClient } from "@/server/auth-admin/client";

type UserRoleRow = {
  user_id: string;
  role: unknown;
};

export type ManagedUserItem = {
  id: string;
  email: string;
  role: AppRole;
  created_at: string | null;
  last_sign_in_at: string | null;
  is_deactivated: boolean;
};

function isDeactivated(bannedUntil: string | null | undefined) {
  if (!bannedUntil) {
    return false;
  }

  const timestamp = Date.parse(bannedUntil);
  if (Number.isNaN(timestamp)) {
    return false;
  }

  return timestamp > Date.now();
}

export async function listManagedUsers() {
  await requireAdmin("/admin/pengguna");
  const adminClient = createAuthAdminClient();

  const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 500
  });

  if (authError) {
    throw new Error(`Gagal memuat daftar akun auth: ${authError.message}`);
  }

  const authUsers = (authData?.users ?? []).filter((user) => Boolean(user.email));
  if (authUsers.length === 0) {
    return [] as ManagedUserItem[];
  }

  const userIds = authUsers.map((user) => user.id);
  const { data: roleRows, error: roleError } = await adminClient
    .from("user_roles")
    .select("user_id, role")
    .in("user_id", userIds);

  if (roleError) {
    throw new Error(`Gagal memuat role pengguna: ${roleError.message}`);
  }

  const roleMap = new Map<string, AppRole>();
  ((roleRows ?? []) as UserRoleRow[]).forEach((row) => {
    roleMap.set(row.user_id, normalizeRole(row.role));
  });

  return authUsers
    .map(
      (user) =>
        ({
          id: user.id,
          email: user.email ?? "",
          role: roleMap.get(user.id) ?? "viewer",
          created_at: user.created_at ?? null,
          last_sign_in_at: user.last_sign_in_at ?? null,
          is_deactivated: isDeactivated(user.banned_until)
        }) as ManagedUserItem
    )
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
}
