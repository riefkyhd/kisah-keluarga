import { expect, test } from "@playwright/test";
import { loginAsRole } from "./helpers/auth";
import { createMemberFixture, createStoryFixture, ensureRoleUser } from "./helpers/supabase-admin";

function createStoryToken() {
  return `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
}

test("viewer bisa membuka timeline dan membaca cerita", async ({ page }) => {
  const editor = await ensureRoleUser("editor");
  const member = await createMemberFixture("Timeline Viewer Member", editor.id);
  const story = await createStoryFixture("Timeline Viewer Story", member.id, editor.id);

  await loginAsRole(page, "viewer", "/timeline");

  await expect(page.getByTestId("timeline-page-heading")).toBeVisible();
  await expect(page.getByRole("link", { name: story.title })).toBeVisible();
});

test("editor bisa create, edit, dan archive cerita", async ({ page }) => {
  const editor = await ensureRoleUser("editor");
  const member = await createMemberFixture("Timeline Editor Member", editor.id);
  const token = createStoryToken();
  const title = `Cerita E2E ${token}`;
  const updatedTitle = `Cerita E2E Updated ${token}`;

  await loginAsRole(page, "editor", `/cerita-baru?personId=${member.id}`);

  await page.getByLabel("Anggota yang terkait").selectOption(member.id);
  await page.getByLabel("Judul cerita").fill(title);
  await page.getByLabel("Tanggal kejadian (opsional)").fill("2001-09-09");
  await page.getByLabel("Cerita singkat").fill("Cerita awal untuk pengujian otomatis.");
  await page.getByRole("button", { name: "Simpan Cerita" }).click();

  await expect(page).toHaveURL(/\/cerita\/.+\?status=created/);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  const createdUrl = page.url();
  const matched = createdUrl.match(/\/cerita\/([^?]+)/);
  if (!matched) {
    throw new Error("ID cerita baru tidak ditemukan dari URL detail.");
  }
  const storyId = matched[1];

  await page.getByRole("link", { name: "Edit Cerita" }).click();
  await expect(page).toHaveURL(new RegExp(`/cerita/${storyId}/edit`));

  await page.getByLabel("Judul cerita").fill(updatedTitle);
  await page.getByLabel("Cerita singkat").fill("Cerita sudah diperbarui oleh editor.");
  await page.getByRole("button", { name: "Simpan Perubahan Cerita" }).click();

  await expect(page).toHaveURL(new RegExp(`/cerita/${storyId}\\?status=updated`));
  await expect(page.getByRole("heading", { name: updatedTitle })).toBeVisible();

  await page.goto(`/cerita/${storyId}/edit`);
  await page.getByRole("button", { name: "Arsipkan Cerita" }).click();
  await expect(page).toHaveURL(new RegExp(`/cerita/${storyId}/edit\\?status=archived`));

  await page.goto("/timeline");
  await expect(page.getByText(updatedTitle)).toHaveCount(0);
});

test("cerita terkait tampil di profil anggota dan viewer tetap read-only", async ({ page }) => {
  const editor = await ensureRoleUser("editor");
  const member = await createMemberFixture("Profile Story Member", editor.id);
  const story = await createStoryFixture("Profile Story", member.id, editor.id);

  await loginAsRole(page, "viewer", `/keluarga/${member.id}`);

  const storiesSection = page.getByTestId("member-stories-section");
  await expect(storiesSection).toBeVisible();
  await expect(storiesSection.getByRole("link", { name: story.title })).toBeVisible();
  await expect(page.getByRole("link", { name: "Tambah Cerita" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Edit Cerita" })).toHaveCount(0);

  await storiesSection.getByRole("link", { name: story.title }).click();
  await expect(page).toHaveURL(new RegExp(`/cerita/${story.id}`));
  await expect(page.getByRole("heading", { name: story.title })).toBeVisible();
  await expect(page.getByRole("link", { name: "Edit Cerita" })).toHaveCount(0);

  await page.goto("/cerita-baru");
  await expect(page).toHaveURL(/\/\?error=forbidden/);

  await page.goto(`/cerita/${story.id}/edit`);
  await expect(page).toHaveURL(/\/\?error=forbidden/);

  await page.goto("/keluarga");
  await expect(page.getByRole("heading", { name: "Daftar Anggota" })).toBeVisible();

  await page.goto("/pohon");
  await expect(page.getByTestId("tree-page-heading")).toBeVisible();
});

test("story yang diarsipkan tidak muncul di timeline publik", async ({ page }) => {
  const editor = await ensureRoleUser("editor");
  const member = await createMemberFixture("Timeline Archived Member", editor.id);
  const archivedStory = await createStoryFixture("Timeline Archived Story", member.id, editor.id, {
    isArchived: true
  });

  await loginAsRole(page, "viewer", "/timeline");
  await expect(page.getByText(archivedStory.title)).toHaveCount(0);
});
