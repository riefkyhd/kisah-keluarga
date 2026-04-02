import { expect, test, type Page } from "@playwright/test";
import { loginAsRole } from "./helpers/auth";
import { createMemberFixture, createRelationshipFixture, ensureRoleUser } from "./helpers/supabase-admin";

async function expectRelationshipStatusOnProfile(
  page: Page,
  personId: string,
  status: "added_parent" | "added_spouse" | "added_child"
) {
  await expect(page).toHaveURL(new RegExp(`/keluarga/${personId}\\?.*relationship_status=${status}`));
  const statusMessages: Record<string, string> = {
    added_parent: "Relasi orang tua berhasil ditambahkan.",
    added_spouse: "Relasi pasangan berhasil ditambahkan.",
    added_child: "Relasi anak berhasil ditambahkan."
  };
  await expect(page.getByRole("main").getByText(statusMessages[status])).toBeVisible();
}

test("editor bisa tambah relasi parent, spouse, dan child dari konteks profil", async ({ page }) => {
  const editor = await ensureRoleUser("editor");
  const person = await createMemberFixture("Rel Person", editor.id);
  const parent = await createMemberFixture("Rel Parent", editor.id);
  const spouse = await createMemberFixture("Rel Spouse", editor.id);
  const child = await createMemberFixture("Rel Child", editor.id);

  await loginAsRole(page, "editor", `/keluarga/${person.id}`);

  const parentSection = page.getByTestId("parents-section");
  await parentSection.locator('select[name="related_person_id"]').selectOption(parent.id);
  await parentSection.getByRole("button", { name: "Tambah Orang Tua" }).click();
  await expectRelationshipStatusOnProfile(page, person.id, "added_parent");
  await expect(parentSection.getByRole("link", { name: parent.full_name })).toBeVisible();

  const spouseSection = page.getByTestId("spouse-section");
  await spouseSection.locator('select[name="related_person_id"]').selectOption(spouse.id);
  await spouseSection.getByRole("button", { name: "Tambah Pasangan" }).click();
  await expectRelationshipStatusOnProfile(page, person.id, "added_spouse");
  await expect(spouseSection.getByRole("link", { name: spouse.full_name })).toBeVisible();

  const childrenSection = page.getByTestId("children-section");
  await childrenSection.locator('select[name="related_person_id"]').selectOption(child.id);
  await childrenSection.getByRole("button", { name: "Tambah Anak" }).click();
  await expectRelationshipStatusOnProfile(page, person.id, "added_child");
  await expect(childrenSection.getByRole("link", { name: child.full_name })).toBeVisible();
});

test("viewer bisa melihat section relasi tapi tidak bisa melakukan write relasi", async ({ page }) => {
  const editor = await ensureRoleUser("editor");
  const viewer = await ensureRoleUser("viewer");

  const person = await createMemberFixture("Viewer Person", editor.id);
  const parent = await createMemberFixture("Viewer Parent", editor.id);
  await createRelationshipFixture({
    fromPersonId: parent.id,
    toPersonId: person.id,
    relationshipType: "parent",
    createdByUserId: editor.id
  });

  await loginAsRole(page, "viewer", `/keluarga/${person.id}`);

  await expect(page.getByTestId("parents-section")).toBeVisible();
  await expect(page.getByTestId("spouse-section")).toBeVisible();
  await expect(page.getByTestId("children-section")).toBeVisible();
  await expect(page.getByTestId("siblings-section")).toBeVisible();
  await expect(page.getByRole("link", { name: parent.full_name })).toBeVisible();

  await expect(page.getByRole("button", { name: "Tambah Orang Tua" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Tambah Pasangan" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Tambah Anak" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Buka menu aksi relasi" })).toHaveCount(0);

  // Keep viewer role explicitly used so fixture assignment remains meaningful.
  await expect(viewer.email).toContain("e2e.viewer");
});

test("duplicate, self-link, aturan ilegal, dan arsip relasi ditangani aman", async ({ page }) => {
  const editor = await ensureRoleUser("editor");
  const person = await createMemberFixture("Rule Person", editor.id);
  const parent = await createMemberFixture("Rule Parent", editor.id);

  await loginAsRole(page, "editor", `/keluarga/${person.id}`);
  const parentSection = page.getByTestId("parents-section");

  await parentSection.locator('select[name="related_person_id"]').selectOption(parent.id);
  await parentSection.getByRole("button", { name: "Tambah Orang Tua" }).click();
  await expect(parentSection.getByRole("link", { name: parent.full_name })).toBeVisible();

  await parentSection.locator('select[name="related_person_id"]').evaluate((node, relatedId) => {
    const select = node as HTMLSelectElement;
    const option = document.createElement("option");
    option.value = String(relatedId);
    option.text = "Parent duplicate";
    select.appendChild(option);
    select.value = String(relatedId);
  }, parent.id);
  await parentSection.getByRole("button", { name: "Tambah Orang Tua" }).click();
  await expect(page.getByRole("main").getByText("Relasi aktif yang sama sudah ada.")).toBeVisible();

  await parentSection.locator('select[name="related_person_id"]').evaluate((node, personId) => {
    const select = node as HTMLSelectElement;
    const option = document.createElement("option");
    option.value = String(personId);
    option.text = "Diri sendiri";
    select.appendChild(option);
    select.value = String(personId);
  }, person.id);
  await parentSection.getByRole("button", { name: "Tambah Orang Tua" }).click();
  await expect(
    page.getByRole("main").getByText("Anggota tidak bisa dihubungkan ke dirinya sendiri.")
  ).toBeVisible();

  const spouseSection = page.getByTestId("spouse-section");
  await spouseSection.locator('select[name="related_person_id"]').selectOption(parent.id);
  await spouseSection.getByRole("button", { name: "Tambah Pasangan" }).click();
  await expect(
    page.getByRole("main").getByText("Relasi ini tidak dapat dibuat karena bertentangan dengan aturan data keluarga.")
  ).toBeVisible();

  await parentSection.getByRole("button", { name: "Buka menu aksi relasi" }).first().click();
  await page.getByRole("menuitem", { name: "Arsipkan relasi" }).click();
  await page.getByRole("button", { name: "Ya, Arsipkan" }).click();
  await expect(page.getByRole("main").getByText("Relasi berhasil diarsipkan.")).toBeVisible();
  await expect(parentSection.getByRole("link", { name: parent.full_name })).toHaveCount(0);
});

test("saudara diturunkan dari orang tua yang sama", async ({ page }) => {
  const editor = await ensureRoleUser("editor");
  const viewer = await ensureRoleUser("viewer");

  const sharedParent = await createMemberFixture("Sibling Parent", editor.id);
  const childA = await createMemberFixture("Sibling Child A", editor.id);
  const childB = await createMemberFixture("Sibling Child B", editor.id);

  await createRelationshipFixture({
    fromPersonId: sharedParent.id,
    toPersonId: childA.id,
    relationshipType: "parent",
    createdByUserId: editor.id
  });
  await createRelationshipFixture({
    fromPersonId: sharedParent.id,
    toPersonId: childB.id,
    relationshipType: "parent",
    createdByUserId: editor.id
  });

  await loginAsRole(page, "viewer", `/keluarga/${childA.id}`);
  const siblingsSection = page.getByTestId("siblings-section");

  await expect(siblingsSection.getByRole("link", { name: childB.full_name })).toBeVisible();
  await expect(siblingsSection.getByRole("link", { name: childA.full_name })).toHaveCount(0);

  await expect(viewer.email).toContain("e2e.viewer");
});
