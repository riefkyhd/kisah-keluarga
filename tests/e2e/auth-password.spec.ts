import { expect, test } from "@playwright/test";
import { ensureRoleUser } from "./helpers/supabase-admin";

test("login email + password berhasil untuk user valid", async ({ page }) => {
  const viewer = await ensureRoleUser("viewer");

  await page.goto("/login?next=%2Fkeluarga");
  await page.getByLabel("Alamat Email").fill(viewer.email);
  await page.getByLabel("Kata Sandi").fill(viewer.password);
  await page.getByRole("button", { name: "Masuk ke Akun" }).click();

  await expect(page).toHaveURL(/\/keluarga/);
  await expect(page.getByRole("heading", { name: "Daftar Anggota" })).toBeVisible();
});

test("login ditolak saat email atau password salah", async ({ page }) => {
  const viewer = await ensureRoleUser("viewer");

  await page.goto("/login?next=%2Fkeluarga");
  await page.getByLabel("Alamat Email").fill(viewer.email);
  await page.getByLabel("Kata Sandi").fill("Password-Salah-123!");
  await page.getByRole("button", { name: "Masuk ke Akun" }).click();

  await expect(page).toHaveURL(/\/login\?error=invalid_credentials/);
  await expect(page.getByText("Email atau kata sandi tidak cocok. Coba periksa lagi.").first()).toBeVisible();
});
