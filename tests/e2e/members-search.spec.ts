import { expect, test, type Page } from "@playwright/test";
import { loginAsRole } from "./helpers/auth";
import {
  attachPhotoFixtureToMember,
  createMemberFixture,
  createRelationshipFixture,
  ensureRoleUser
} from "./helpers/supabase-admin";

function createSearchToken() {
  return `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
}

function memberCardByName(page: Page, fullName: string) {
  return page.locator("ul > li").filter({ hasText: fullName });
}

async function waitForQueryValue(page: Page, key: string, expectedValue: string | null) {
  await expect
    .poll(() => {
      const url = new URL(page.url());
      return url.searchParams.get(key);
    })
    .toBe(expectedValue);
}

test("viewer bisa mencari berdasarkan full name dan partial query", async ({ page }) => {
  const editor = await ensureRoleUser("editor");
  const token = createSearchToken();
  const member = await createMemberFixture(`Cari Nama Lengkap ${token}`, editor.id);

  await loginAsRole(page, "viewer", "/keluarga");

  await page.getByLabel("Cari nama atau panggilan").fill(member.full_name);
  await waitForQueryValue(page, "q", member.full_name);

  await expect(memberCardByName(page, member.full_name)).toHaveCount(1);

  const partialQuery = token.slice(0, 8);
  await page.getByLabel("Cari nama atau panggilan").fill(partialQuery);
  await waitForQueryValue(page, "q", partialQuery);

  await expect(memberCardByName(page, member.full_name)).toHaveCount(1);
});

test("viewer bisa mencari berdasarkan nickname", async ({ page }) => {
  const editor = await ensureRoleUser("editor");
  const token = createSearchToken();
  const nickname = `Panggilan ${token}`;
  const member = await createMemberFixture(`Cari Nickname ${token}`, editor.id, { nickname });

  await loginAsRole(page, "viewer", "/keluarga");

  await page.getByLabel("Cari nama atau panggilan").fill(nickname);
  await waitForQueryValue(page, "q", nickname);

  await expect(memberCardByName(page, member.full_name)).toHaveCount(1);
  await expect(memberCardByName(page, `"${nickname}"`)).toHaveCount(1);
});

test("anggota arsip tetap tersembunyi dan empty state tampil jelas", async ({ page }) => {
  const editor = await ensureRoleUser("editor");
  const token = createSearchToken();
  const archivedMember = await createMemberFixture(`Arsip Direktori ${token}`, editor.id, {
    isArchived: true,
    nickname: `Arsip-${token}`
  });

  await loginAsRole(page, "viewer", "/keluarga");
  await expect(memberCardByName(page, archivedMember.full_name)).toHaveCount(0);

  await page.getByLabel("Cari nama atau panggilan").fill(archivedMember.full_name);
  await waitForQueryValue(page, "q", archivedMember.full_name);

  await expect(memberCardByName(page, archivedMember.full_name)).toHaveCount(0);
  await expect(
    page.getByText("Belum ada anggota yang cocok dengan pencarian Anda. Coba nama atau panggilan lain.")
  ).toBeVisible();
});

test("hasil pencarian tetap menampilkan foto/fallback, dan editor flow direktori tidak rusak", async ({ page }) => {
  const editor = await ensureRoleUser("editor");
  const token = createSearchToken();
  const photoMember = await createMemberFixture(`Search Foto ${token}`, editor.id);
  const fallbackMember = await createMemberFixture(`Search Fallback ${token}`, editor.id);

  await attachPhotoFixtureToMember(photoMember.id, editor.id);
  await loginAsRole(page, "editor", "/keluarga");

  await page.getByLabel("Cari nama atau panggilan").fill(token);
  await waitForQueryValue(page, "q", token);

  await expect(memberCardByName(page, photoMember.full_name)).toHaveCount(1);
  await expect(memberCardByName(page, fallbackMember.full_name)).toHaveCount(1);

  const photoMemberCard = page.locator("a", { hasText: photoMember.full_name }).first();
  await expect(photoMemberCard.locator(`img[alt="Foto profil ${photoMember.full_name}"]`)).toBeVisible();

  const fallbackMemberCard = page.locator("a", { hasText: fallbackMember.full_name }).first();
  await expect(fallbackMemberCard.locator(`[aria-label="Foto profil ${fallbackMember.full_name}"]`)).toBeVisible();
  await expect(fallbackMemberCard.locator(`img[alt="Foto profil ${fallbackMember.full_name}"]`)).toHaveCount(0);

  await expect(page.getByRole("link", { name: "Tambah Anggota (Editor/Admin)" })).toBeVisible();
});

test("generation filter pills memfilter server-side sesuai level generasi", async ({ page }) => {
  const editor = await ensureRoleUser("editor");
  const token = createSearchToken();
  const root = await createMemberFixture(`Gen Root ${token}`, editor.id);
  const child = await createMemberFixture(`Gen Child ${token}`, editor.id);
  const grandchild = await createMemberFixture(`Gen Grandchild ${token}`, editor.id);

  await createRelationshipFixture({
    fromPersonId: root.id,
    toPersonId: child.id,
    relationshipType: "parent",
    createdByUserId: editor.id
  });
  await createRelationshipFixture({
    fromPersonId: child.id,
    toPersonId: grandchild.id,
    relationshipType: "parent",
    createdByUserId: editor.id
  });

  await loginAsRole(page, "viewer", "/keluarga");
  await page.getByLabel("Cari nama atau panggilan").fill(token);
  await waitForQueryValue(page, "q", token);

  await page.getByRole("button", { name: "Generasi 1" }).click();
  await waitForQueryValue(page, "gen", "1");
  await expect(memberCardByName(page, root.full_name)).toHaveCount(1);
  await expect(memberCardByName(page, child.full_name)).toHaveCount(0);
  await expect(memberCardByName(page, grandchild.full_name)).toHaveCount(0);

  await page.getByRole("button", { name: "Generasi 2" }).click();
  await waitForQueryValue(page, "gen", "2");
  await expect(memberCardByName(page, root.full_name)).toHaveCount(0);
  await expect(memberCardByName(page, child.full_name)).toHaveCount(1);

  await page.getByRole("button", { name: "Generasi 3" }).click();
  await waitForQueryValue(page, "gen", "3");
  await expect(memberCardByName(page, grandchild.full_name)).toHaveCount(1);
});

test("pagination server-side membagi hasil lebih dari 20 anggota", async ({ page }) => {
  const editor = await ensureRoleUser("editor");
  const token = createSearchToken();

  for (let index = 0; index < 21; index += 1) {
    await createMemberFixture(`Pagination ${token} Member ${index + 1}`, editor.id);
  }

  await loginAsRole(page, "viewer", "/keluarga");
  await page.getByLabel("Cari nama atau panggilan").fill(token);
  await waitForQueryValue(page, "q", token);

  await expect(page.getByText("Page 1 of 2")).toBeVisible();
  await expect(page.getByTestId("member-directory-card")).toHaveCount(20);

  await page.getByRole("link", { name: "Next →" }).click();
  await waitForQueryValue(page, "page", "2");
  await expect(page.getByText("Page 2 of 2")).toBeVisible();
  await expect(page.getByTestId("member-directory-card")).toHaveCount(1);
});
