import { expect, test, type Page } from "@playwright/test";
import { loginAsRole } from "./helpers/auth";
import { attachPhotoFixtureToMember, createMemberFixture, ensureRoleUser } from "./helpers/supabase-admin";

function createSearchToken() {
  return `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
}

function memberCardByName(page: Page, fullName: string) {
  return page.locator("ul > li").filter({ hasText: fullName });
}

test("viewer bisa mencari berdasarkan full name dan partial query", async ({ page }) => {
  const editor = await ensureRoleUser("editor");
  const token = createSearchToken();
  const member = await createMemberFixture(`Cari Nama Lengkap ${token}`, editor.id);

  await loginAsRole(page, "viewer", "/keluarga");

  await page.getByLabel("Cari nama atau panggilan").fill(member.full_name);
  await page.getByRole("button", { name: "Cari" }).click();

  await expect(page).toHaveURL(/\/keluarga\?q=/);
  await expect(memberCardByName(page, member.full_name)).toHaveCount(1);

  const partialQuery = token.slice(0, 8);
  await page.getByLabel("Cari nama atau panggilan").fill(partialQuery);
  await page.getByRole("button", { name: "Cari" }).click();

  await expect(memberCardByName(page, member.full_name)).toHaveCount(1);
});

test("viewer bisa mencari berdasarkan nickname", async ({ page }) => {
  const editor = await ensureRoleUser("editor");
  const token = createSearchToken();
  const nickname = `Panggilan ${token}`;
  const member = await createMemberFixture(`Cari Nickname ${token}`, editor.id, { nickname });

  await loginAsRole(page, "viewer", "/keluarga");

  await page.getByLabel("Cari nama atau panggilan").fill(nickname);
  await page.getByRole("button", { name: "Cari" }).click();

  await expect(memberCardByName(page, member.full_name)).toHaveCount(1);
  await expect(memberCardByName(page, `Panggilan: ${nickname}`)).toHaveCount(1);
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
  await page.getByRole("button", { name: "Cari" }).click();

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
  await page.getByRole("button", { name: "Cari" }).click();

  await expect(memberCardByName(page, photoMember.full_name)).toHaveCount(1);
  await expect(memberCardByName(page, fallbackMember.full_name)).toHaveCount(1);

  const photoMemberCard = page.locator("a", { hasText: photoMember.full_name }).first();
  await expect(photoMemberCard.locator(`img[alt="Foto profil ${photoMember.full_name}"]`)).toBeVisible();

  const fallbackMemberCard = page.locator("a", { hasText: fallbackMember.full_name }).first();
  await expect(fallbackMemberCard.locator(`[aria-label="Foto profil ${fallbackMember.full_name}"]`)).toBeVisible();
  await expect(fallbackMemberCard.locator(`img[alt="Foto profil ${fallbackMember.full_name}"]`)).toHaveCount(0);

  await expect(page.getByRole("link", { name: "Tambah Anggota (Editor/Admin)" })).toBeVisible();
});
