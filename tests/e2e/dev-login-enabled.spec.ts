import { expect, test, type Page } from "@playwright/test";

test.skip(
  process.env.ENABLE_DEV_DUMMY_LOGIN !== "true",
  "Spec ini khusus untuk mode dev dummy login enabled."
);

async function loginFromDevPage(page: Page, role: "viewer" | "editor" | "admin", nextPath: string) {
  await page.goto(`/dev-login?next=${encodeURIComponent(nextPath)}`);
  await expect(page.getByTestId("dev-login-heading")).toBeVisible();
  await page.getByLabel("Peran akun dummy").selectOption(role);
  await page.getByLabel("Tujuan setelah login (opsional)").fill(nextPath);
  await page.getByRole("button", { name: "Masuk sebagai akun dummy" }).click();
  await page.waitForLoadState("networkidle");
}

test("login page menampilkan link dev-login saat mode aman aktif", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("link", { name: "Buka Mode Pengujian Lokal" })).toBeVisible();
});

test("viewer login via dev-login tetap tidak bisa akses route write", async ({ page }) => {
  await loginFromDevPage(page, "viewer", "/keluarga");
  await expect(page).toHaveURL(/\/keluarga/);

  await page.goto("/cerita-baru");
  await expect(page).toHaveURL(/\/\?error=forbidden/);
});

test("editor login via dev-login bisa akses route write editor", async ({ page }) => {
  await loginFromDevPage(page, "editor", "/cerita-baru");
  await expect(page.getByRole("heading", { name: "Tambah Cerita Keluarga" })).toBeVisible();
});

test("admin login via dev-login bisa akses route admin", async ({ page }) => {
  await loginFromDevPage(page, "admin", "/admin");
  await expect(page.getByRole("heading", { name: "Admin" })).toBeVisible();
});

test("next path eksternal ditolak dan disanitasi ke fallback aman", async ({ page }) => {
  await loginFromDevPage(page, "viewer", "https://contoh-eksternal.com/evil");
  await expect(page).toHaveURL(/\/keluarga/);
});
