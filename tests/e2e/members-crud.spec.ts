import { expect, test } from "@playwright/test";
import { loginAsRole } from "./helpers/auth";

function createUniqueMemberName() {
  return `E2E Member ${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
}

test("editor bisa create, edit, archive, dan restore anggota", async ({ page }) => {
  const memberName = createUniqueMemberName();
  const updatedNickname = "Panggilan E2E";

  await loginAsRole(page, "editor", "/anggota-baru");

  await page.getByLabel("Nama lengkap").fill(memberName);
  await page.getByLabel("Nama panggilan (opsional)").fill("Nama Awal");
  await page.getByLabel("Status kehidupan").selectOption("true");
  await page.getByRole("button", { name: "Simpan Anggota" }).click();

  await expect(page).toHaveURL(/\/keluarga\/.+\?created=1/);
  await expect(page.getByRole("heading", { name: memberName })).toBeVisible();

  const createdUrl = page.url();
  const matched = createdUrl.match(/\/keluarga\/([^?]+)/);
  if (!matched) {
    throw new Error("ID anggota baru tidak ditemukan dari URL profile.");
  }
  const personId = matched[1];

  await page.getByRole("link", { name: "Edit / Arsipkan Anggota" }).click();
  await expect(page).toHaveURL(new RegExp(`/anggota/${personId}/edit`));

  await page.getByLabel("Nama panggilan (opsional)").fill(updatedNickname);
  await page.getByRole("button", { name: "Simpan Perubahan" }).click();

  await expect(page).toHaveURL(new RegExp(`/keluarga/${personId}\\?updated=1`));
  await expect(page.getByText(`Panggilan: ${updatedNickname}`)).toBeVisible();

  await page.goto(`/anggota/${personId}/edit`);
  await page.getByRole("button", { name: "Arsipkan Anggota" }).click();
  await expect(page).toHaveURL(new RegExp(`/anggota/${personId}/edit\\?status=archived`));

  await page.goto("/keluarga");
  await expect(page.getByText(memberName)).toHaveCount(0);

  await page.goto(`/anggota/${personId}/edit`);
  await page.getByRole("button", { name: "Pulihkan Anggota" }).click();
  await expect(page).toHaveURL(new RegExp(`/anggota/${personId}/edit\\?status=restored`));

  await page.goto("/keluarga");
  await expect(page.getByText(memberName)).toBeVisible();
});
