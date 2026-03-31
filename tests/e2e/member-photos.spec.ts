import { expect, test } from "@playwright/test";
import { loginAsRole } from "./helpers/auth";
import {
  attachPhotoFixtureToMember,
  createInvalidUpload,
  createMemberFixture,
  createTinyPngUpload,
  ensureRoleUser
} from "./helpers/supabase-admin";

test("editor bisa unggah, ganti, dan hapus foto profil anggota", async ({ page }) => {
  const editor = await ensureRoleUser("editor");
  const member = await createMemberFixture("Photo Flow", editor.id);

  await loginAsRole(page, "editor", `/keluarga/${member.id}`);

  await page
    .getByTestId("member-photo-upload-input")
    .setInputFiles(createTinyPngUpload("first-photo.png"));
  await page.getByRole("button", { name: "Unggah Foto" }).click();

  await expect(page.getByText("Foto profil berhasil diunggah.")).toBeVisible();
  await expect(page.locator('[data-testid="member-photo-image"] img')).toBeVisible();

  await page.goto("/keluarga");
  const memberCard = page.locator("a", { hasText: member.full_name }).first();
  await expect(memberCard.locator(`img[alt="Foto profil ${member.full_name}"]`)).toBeVisible();

  await page.goto(`/keluarga/${member.id}`);
  await page
    .getByTestId("member-photo-upload-input")
    .setInputFiles(createTinyPngUpload("second-photo.png"));
  await page.getByRole("button", { name: "Ganti Foto" }).click();
  await expect(page.getByText("Foto profil berhasil diperbarui.")).toBeVisible();

  await page.getByRole("button", { name: "Hapus Foto" }).click();
  await expect(page.getByText("Foto profil berhasil dihapus.")).toBeVisible();
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

  await page.goto("/keluarga");
  const memberCard = page.locator("a", { hasText: member.full_name }).first();
  await expect(memberCard.locator(`img[alt="Foto profil ${member.full_name}"]`)).toBeVisible();
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
