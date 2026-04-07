import { expect, test, type Page } from "@playwright/test";
import { loginAsRole } from "./helpers/auth";
import {
  attachPhotoFixtureToMember,
  createInvalidUpload,
  createLargeJpegUpload,
  createMemberFixture,
  createTinyPngUpload,
  getMemberPhotoStorageMeta,
  ensureRoleUser
} from "./helpers/supabase-admin";

async function expectPhotoStatusOnProfile(
  page: Page,
  memberId: string,
  status: "uploaded" | "replaced" | "removed"
) {
  await expect(page).toHaveURL(new RegExp(`/keluarga/${memberId}\\?.*photo_status=${status}`));
  const statusMessages: Record<typeof status, string> = {
    uploaded: "Foto profil berhasil diunggah.",
    replaced: "Foto profil berhasil diperbarui.",
    removed: "Foto profil berhasil dihapus."
  };
  await expect(page.getByRole("main").getByText(statusMessages[status])).toBeVisible();
}

test("editor bisa unggah, ganti, dan hapus foto profil anggota", async ({ page }) => {
  const editor = await ensureRoleUser("editor");
  const member = await createMemberFixture("Photo Flow", editor.id);

  await loginAsRole(page, "editor", `/keluarga/${member.id}`);

  await page
    .getByTestId("member-photo-upload-input")
    .setInputFiles(createTinyPngUpload("first-photo.png"));
  await page.getByRole("button", { name: "Unggah Foto" }).click();

  await expectPhotoStatusOnProfile(page, member.id, "uploaded");
  await expect(page.locator('[data-testid="member-photo-image"] img')).toBeVisible();
  const uploadedMeta = await getMemberPhotoStorageMeta(member.id);
  expect(uploadedMeta).not.toBeNull();
  expect(uploadedMeta?.path.endsWith(".webp")).toBeTruthy();
  expect(uploadedMeta?.mimetype).toBe("image/webp");
  expect((uploadedMeta?.size ?? 0) > 0).toBeTruthy();

  await page.goto(`/keluarga/${member.id}`);
  await page
    .getByTestId("member-photo-upload-input")
    .setInputFiles(createTinyPngUpload("second-photo.png"));
  await page.getByRole("button", { name: "Ganti Foto" }).click();
  await expectPhotoStatusOnProfile(page, member.id, "replaced");

  await page.getByRole("button", { name: "Hapus Foto" }).click();
  await expectPhotoStatusOnProfile(page, member.id, "removed");
  await expect(page.locator('[data-testid="member-photo-image"] img')).toHaveCount(0);
});

test("viewer hanya bisa melihat foto tanpa kontrol ubah", async ({ page }) => {
  const editor = await ensureRoleUser("editor");
  const member = await createMemberFixture("Photo Viewer", editor.id);
  await attachPhotoFixtureToMember(member.id, editor.id);

  await loginAsRole(page, "viewer", `/keluarga/${member.id}`);

  await expect(page.getByTestId("member-photo-manager")).toBeVisible();
  await expect(page.getByTestId("member-photo-upload-input")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Unggah Foto" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Ganti Foto" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Hapus Foto" })).toHaveCount(0);
  await expect(page.locator('[data-testid="member-photo-image"] img')).toBeVisible();
});

test("unggah foto galeri yang lebih besar tetap sukses dan tersimpan teroptimasi", async ({ page }) => {
  const editor = await ensureRoleUser("editor");
  const member = await createMemberFixture("Photo Large", editor.id);
  const largeUpload = await createLargeJpegUpload("large-gallery-photo.jpg");
  expect(largeUpload.buffer.length).toBeLessThanOrEqual(4 * 1024 * 1024);

  await loginAsRole(page, "editor", `/keluarga/${member.id}`);
  await page.getByTestId("member-photo-upload-input").setInputFiles(largeUpload);
  await page.getByRole("button", { name: "Unggah Foto" }).click();

  await expectPhotoStatusOnProfile(page, member.id, "uploaded");
  const uploadedMeta = await getMemberPhotoStorageMeta(member.id);
  expect(uploadedMeta).not.toBeNull();
  expect(uploadedMeta?.path.endsWith(".webp")).toBeTruthy();
  expect(uploadedMeta?.mimetype).toBe("image/webp");
  const storedSize = uploadedMeta?.size ?? 0;
  expect(storedSize).toBeGreaterThan(0);
  expect(storedSize).toBeLessThan(largeUpload.buffer.length);
});

test("unggah file non-gambar diblokir dengan pesan jelas", async ({ page }) => {
  const editor = await ensureRoleUser("editor");
  const member = await createMemberFixture("Photo Invalid", editor.id);

  await loginAsRole(page, "editor", `/keluarga/${member.id}`);

  await page.getByTestId("member-photo-upload-input").setInputFiles(createInvalidUpload("invalid.txt"));
  await page.getByRole("button", { name: "Unggah Foto" }).click();

  await expect(page.getByText("Format foto belum didukung. Gunakan JPG, PNG, atau WEBP.")).toBeVisible();
  await expect(page.locator('[data-testid="member-photo-image"] img')).toHaveCount(0);
});
