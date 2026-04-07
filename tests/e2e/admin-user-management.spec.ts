import { expect, test } from "@playwright/test";
import { loginAsRole } from "./helpers/auth";

function uniqueUserEmail() {
  return `managed.${Date.now()}-${Math.floor(Math.random() * 10_000)}@kisah-keluarga.local`;
}

test("admin dapat membuat user, ubah role, reset password, dan nonaktif/aktifkan akun", async ({ page }) => {
  const email = uniqueUserEmail();
  const initialPassword = "Init-Password-123!";
  const resetPassword = "Reset-Password-456!";

  await loginAsRole(page, "admin", "/admin/pengguna");
  await expect(page.getByRole("heading", { name: "Manajemen Pengguna" })).toBeVisible();

  await page.getByLabel("Email akun baru").fill(email);
  await page.getByLabel("Kata sandi awal").fill(initialPassword);
  await page.getByLabel("Role akun baru").selectOption("viewer");
  await page.getByRole("button", { name: "Buat Akun" }).click();
  await expect(page.getByText("Akun baru berhasil dibuat.").first()).toBeVisible();

  let row = page.getByTestId("managed-user-item").filter({ hasText: email });
  await expect(row).toBeVisible();

  await row.getByLabel("Role akses").selectOption("editor");
  await row.getByRole("button", { name: "Simpan Role" }).click();
  await expect(page.getByText("Role akun berhasil diperbarui.").first()).toBeVisible();

  row = page.getByTestId("managed-user-item").filter({ hasText: email });
  await row.getByRole("button", { name: "Nonaktifkan Akun" }).click();
  await page.getByRole("button", { name: "Ya, Nonaktifkan" }).click();
  await expect(page.getByText("Akun berhasil dinonaktifkan.").first()).toBeVisible();

  await page.context().clearCookies();
  await page.goto("/login?next=%2Fkeluarga");
  await page.getByLabel("Alamat Email").fill(email);
  await page.getByLabel("Kata Sandi").fill(initialPassword);
  await page.getByRole("button", { name: "Masuk ke Akun" }).click();
  await expect(page).toHaveURL(/\/login\?error=invalid_credentials/);

  await loginAsRole(page, "admin", "/admin/pengguna");
  row = page.getByTestId("managed-user-item").filter({ hasText: email });

  await row.getByRole("button", { name: "Aktifkan Kembali" }).click();
  await expect(page.getByText("Akun berhasil diaktifkan kembali.").first()).toBeVisible();

  row = page.getByTestId("managed-user-item").filter({ hasText: email });
  await row.getByLabel("Kata sandi baru").fill(resetPassword);
  await row.getByRole("button", { name: "Simpan Kata Sandi" }).click();
  await expect(page.getByText("Kata sandi akun berhasil diperbarui.").first()).toBeVisible();

  await page.context().clearCookies();
  await page.goto("/login?next=%2Fcerita-baru");
  await page.getByLabel("Alamat Email").fill(email);
  await page.getByLabel("Kata Sandi").fill(resetPassword);
  await page.getByRole("button", { name: "Masuk ke Akun" }).click();

  await expect(page.getByRole("heading", { name: "Tambah Cerita Keluarga" })).toBeVisible();
});
