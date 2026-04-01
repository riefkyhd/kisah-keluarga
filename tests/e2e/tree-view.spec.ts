import { expect, test } from "@playwright/test";
import { loginAsRole } from "./helpers/auth";
import { createMemberFixture, createRelationshipFixture, ensureRoleUser } from "./helpers/supabase-admin";

test("viewer bisa membuka halaman pohon keluarga", async ({ page }) => {
  const editor = await ensureRoleUser("editor");
  const focus = await createMemberFixture("Tree Viewer", editor.id);

  await loginAsRole(page, "viewer", `/pohon?personId=${focus.id}`);

  await expect(page).toHaveURL(/\/pohon\?personId=/);
  await expect(page.getByTestId("tree-page-heading")).toBeVisible();
  await expect(page.getByTestId("tree-root-node")).toContainText(focus.full_name);
  await expect(page.getByTestId("family-tree-visual")).toBeVisible();
});

test("tree menampilkan parent-child dan spouse, archived member tidak tampil, dan node bisa buka profil", async ({ page }) => {
  const editor = await ensureRoleUser("editor");

  const focus = await createMemberFixture("Tree Focus", editor.id);
  const parent = await createMemberFixture("Tree Parent", editor.id);
  const spouse = await createMemberFixture("Tree Spouse", editor.id);
  const child = await createMemberFixture("Tree Child", editor.id);
  const archivedChild = await createMemberFixture("Tree Archived Child", editor.id, {
    isArchived: true
  });

  await createRelationshipFixture({
    fromPersonId: parent.id,
    toPersonId: focus.id,
    relationshipType: "parent",
    createdByUserId: editor.id
  });
  await createRelationshipFixture({
    fromPersonId: focus.id,
    toPersonId: child.id,
    relationshipType: "parent",
    createdByUserId: editor.id
  });
  await createRelationshipFixture({
    fromPersonId: focus.id,
    toPersonId: archivedChild.id,
    relationshipType: "parent",
    createdByUserId: editor.id
  });
  await createRelationshipFixture({
    fromPersonId: focus.id,
    toPersonId: spouse.id,
    relationshipType: "spouse",
    createdByUserId: editor.id
  });

  await loginAsRole(page, "viewer", `/pohon?personId=${focus.id}`);

  await expect(page.getByTestId("tree-parent-node").filter({ hasText: parent.full_name })).toHaveCount(1);
  await expect(page.getByTestId("tree-spouse-node").filter({ hasText: spouse.full_name })).toHaveCount(1);
  await expect(page.getByTestId("tree-child-node").filter({ hasText: child.full_name })).toHaveCount(1);
  await expect(page.getByText(archivedChild.full_name)).toHaveCount(0);

  await expect(page.getByTestId("tree-link-parent-child")).toHaveCount(2);
  await expect(page.getByTestId("tree-link-spouse")).toHaveCount(1);

  await page.getByTestId("tree-child-node").filter({ hasText: child.full_name }).click();
  await expect(page).toHaveURL(new RegExp(`/keluarga/${child.id}`));
  await expect(page.getByRole("heading", { name: child.full_name })).toBeVisible();
});

test("editor tetap bisa mengakses route pohon dengan aman", async ({ page }) => {
  await loginAsRole(page, "editor", "/pohon");
  await expect(page.getByTestId("tree-page-heading")).toBeVisible();
  await expect(page.getByRole("link", { name: "Buka Direktori Keluarga" })).toBeVisible();
});

test("admin tetap bisa mengakses route pohon dengan aman", async ({ page }) => {
  await loginAsRole(page, "admin", "/pohon");
  await expect(page.getByTestId("tree-page-heading")).toBeVisible();
});
