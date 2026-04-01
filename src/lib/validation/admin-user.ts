import { z } from "zod";
import { APP_ROLES } from "@/lib/auth/roles";

const normalizedEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Format email tidak valid.")
  .max(320, "Email terlalu panjang.");

const passwordSchema = z
  .string()
  .min(8, "Kata sandi minimal 8 karakter.")
  .max(72, "Kata sandi maksimal 72 karakter.");

export const createManagedUserSchema = z.object({
  email: normalizedEmailSchema,
  password: passwordSchema,
  role: z.enum(APP_ROLES)
});

export const updateManagedUserRoleSchema = z.object({
  user_id: z.string().uuid("ID pengguna tidak valid."),
  role: z.enum(APP_ROLES)
});

export const resetManagedUserPasswordSchema = z.object({
  user_id: z.string().uuid("ID pengguna tidak valid."),
  password: passwordSchema
});

export const updateManagedUserStateSchema = z.object({
  user_id: z.string().uuid("ID pengguna tidak valid."),
  state: z.enum(["deactivate", "reactivate"])
});
