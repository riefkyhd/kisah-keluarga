import { expect, test } from "@playwright/test";
import { loginAsRole } from "./helpers/auth";
import { createMemberFixture, ensureRoleUser } from "./helpers/supabase-admin";

test("toolbar search membuka drawer anggota dari root canvas", async ({ page }) => {
  const editor = await ensureRoleUser("editor");
  const member = await createMemberFixture("Toolbar Search Member", editor.id);

  await loginAsRole(page, "viewer", "/");
  await expect(page.getByTestId("family-tree-visual")).toBeVisible();

  await page.getByRole("button", { name: "Cari Anggota" }).click();
  await page.getByPlaceholder("Cari nama atau panggilan...").fill("Toolbar Search");
  await page.getByRole("button", { name: member.full_name }).click();

  await expect(page).toHaveURL(new RegExp(`memberId=${member.id}`));
  await expect(page.getByTestId("member-drawer")).toBeVisible();
});

test("toolbar menu role-gated untuk viewer/editor/admin", async ({ page }) => {
  await loginAsRole(page, "viewer", "/");
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("menuitem", { name: "Direktori Keluarga" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Timeline Cerita" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Kelola Pengguna" })).toHaveCount(0);

  await loginAsRole(page, "editor", "/");
  await expect(page.getByRole("button", { name: "Tambah Anggota" })).toBeVisible();
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("menuitem", { name: "Kelola Pengguna" })).toHaveCount(0);

  await loginAsRole(page, "admin", "/");
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("menuitem", { name: "Kelola Pengguna" })).toBeVisible();
});
