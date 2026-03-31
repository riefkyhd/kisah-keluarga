export const APP_ROLES = ["viewer", "contributor", "editor", "admin"] as const;

export type AppRole = (typeof APP_ROLES)[number];

const ROLE_LEVEL: Record<AppRole, number> = {
  viewer: 0,
  contributor: 1,
  editor: 2,
  admin: 3
};

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && APP_ROLES.includes(value as AppRole);
}

export function normalizeRole(value: unknown): AppRole {
  return isAppRole(value) ? value : "viewer";
}

export function hasMinimumRole(userRole: AppRole, minimumRole: AppRole) {
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[minimumRole];
}
