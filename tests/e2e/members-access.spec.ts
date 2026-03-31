import { expect, test } from "@playwright/test";
import { loginAsRole } from "./helpers/auth";
import { createMemberFixture, ensureRoleUser } from "./helpers/supabase-admin";

test("viewer bisa baca direktori/profil tapi tidak bisa akses write routes", async ({ page }) => {
  const viewer = await ensureRoleUser("viewer");
  const fixture = await createMemberFixture("Viewer Access", viewer.id);

  await loginAsRole(page, "viewer", "/keluarga");
  await expect(page.getByText(fixture.full_name)).toBeVisible();

  await page.goto(`/keluarga/${fixture.id}`);
  await expect(page.getByRole("heading", { name: fixture.full_name })).toBeVisible();

  await page.goto("/anggota-baru");
  await expect(page).toHaveURL(/\/\?error=forbidden/);

  await page.goto(`/anggota/${fixture.id}/edit`);
  await expect(page).toHaveURL(/\/\?error=forbidden/);
});

test("editor bisa akses halaman create/edit, tapi bukan admin dashboard", async ({ page }) => {
  const editor = await ensureRoleUser("editor");
  const fixture = await createMemberFixture("Editor Access", editor.id);

  await loginAsRole(page, "editor", "/anggota-baru");
  await expect(page.getByRole("heading", { name: "Tambah Anggota Baru" })).toBeVisible();

  await page.goto(`/anggota/${fixture.id}/edit`);
  await expect(page.getByRole("heading", { name: "Edit Anggota" })).toBeVisible();

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/\?error=forbidden/);
});

test("admin bisa akses halaman admin", async ({ page }) => {
  await loginAsRole(page, "admin", "/admin");
  await expect(page.getByRole("heading", { name: "Admin" })).toBeVisible();
});
