"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/permissions/guards";
import {
  createManagedUserSchema,
  resetManagedUserPasswordSchema,
  updateManagedUserRoleSchema,
  updateManagedUserStateSchema
} from "@/lib/validation/admin-user";
import { createAuthAdminClient } from "@/server/auth-admin/client";

type AdminUserActionError =
  | "invalid_form"
  | "create_failed"
  | "role_sync_failed"
  | "role_update_failed"
  | "password_update_failed"
  | "state_update_failed"
  | "cannot_deactivate_self";

type AdminUserActionStatus =
  | "user_created"
  | "role_updated"
  | "password_updated"
  | "user_deactivated"
  | "user_reactivated";

function toFormObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function redirectAdminUsersError(error: AdminUserActionError): never {
  redirect(`/admin/pengguna?error=${error}`);
}

function redirectAdminUsersStatus(status: AdminUserActionStatus): never {
  redirect(`/admin/pengguna?status=${status}`);
}

function revalidateAdminUsersPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/pengguna");
}

export async function createManagedUserAction(formData: FormData) {
  const parsed = createManagedUserSchema.safeParse(toFormObject(formData));
  if (!parsed.success) {
    redirectAdminUsersError("invalid_form");
  }

  const { user: actor } = await requireAdmin("/admin/pengguna");
  const adminClient = createAuthAdminClient();

  const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      managed_by_admin: true,
      created_by_admin: actor.id
    }
  });

  if (createError || !createData.user) {
    redirectAdminUsersError("create_failed");
  }

  const { error: roleError } = await adminClient
    .from("user_roles")
    .upsert(
      {
        user_id: createData.user.id,
        role: parsed.data.role
      },
      { onConflict: "user_id" }
    );

  if (roleError) {
    redirectAdminUsersError("role_sync_failed");
  }

  revalidateAdminUsersPages();
  redirectAdminUsersStatus("user_created");
}

export async function updateManagedUserRoleAction(formData: FormData) {
  const parsed = updateManagedUserRoleSchema.safeParse(toFormObject(formData));
  if (!parsed.success) {
    redirectAdminUsersError("invalid_form");
  }

  await requireAdmin("/admin/pengguna");
  const adminClient = createAuthAdminClient();

  const { error } = await adminClient
    .from("user_roles")
    .upsert({ user_id: parsed.data.user_id, role: parsed.data.role }, { onConflict: "user_id" });

  if (error) {
    redirectAdminUsersError("role_update_failed");
  }

  revalidateAdminUsersPages();
  redirectAdminUsersStatus("role_updated");
}

export async function resetManagedUserPasswordAction(formData: FormData) {
  const parsed = resetManagedUserPasswordSchema.safeParse(toFormObject(formData));
  if (!parsed.success) {
    redirectAdminUsersError("invalid_form");
  }

  await requireAdmin("/admin/pengguna");
  const adminClient = createAuthAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(parsed.data.user_id, {
    password: parsed.data.password
  });

  if (error) {
    redirectAdminUsersError("password_update_failed");
  }

  revalidateAdminUsersPages();
  redirectAdminUsersStatus("password_updated");
}

export async function updateManagedUserStateAction(formData: FormData) {
  const parsed = updateManagedUserStateSchema.safeParse(toFormObject(formData));
  if (!parsed.success) {
    redirectAdminUsersError("invalid_form");
  }

  const { user: actor } = await requireAdmin("/admin/pengguna");
  if (parsed.data.state === "deactivate" && parsed.data.user_id === actor.id) {
    redirectAdminUsersError("cannot_deactivate_self");
  }

  const adminClient = createAuthAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(parsed.data.user_id, {
    ban_duration: parsed.data.state === "deactivate" ? "876000h" : "none"
  });

  if (error) {
    redirectAdminUsersError("state_update_failed");
  }

  revalidateAdminUsersPages();
  redirectAdminUsersStatus(parsed.data.state === "deactivate" ? "user_deactivated" : "user_reactivated");
}
