import { expect, test } from "@playwright/test";
import { loginAsRole } from "./helpers/auth";

function createUniqueMemberName() {
  return `E2E Member ${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
}

test("editor bisa create dan edit anggota lewat flow canvas", async ({ page }) => {
  const memberName = createUniqueMemberName();
  const updatedNickname = "Panggilan E2E";

  await loginAsRole(page, "editor", "/anggota-baru");
  await expect(page).toHaveURL(/\/\?action=add/);
  await expect(page.getByRole("heading", { name: "Tambah Anggota Baru" })).toBeVisible();

  const addDialog = page.getByRole("dialog", { name: "Tambah Anggota Baru" });
  await addDialog.getByLabel("Nama lengkap").fill(memberName);
  await addDialog.getByLabel("Nama panggilan (opsional)").fill("Nama Awal");
  await addDialog.getByLabel("Status kehidupan").selectOption("true");
  const saveCreateButton = addDialog.getByRole("button", { name: "Simpan Anggota" });
  await saveCreateButton.evaluate((button) => {
    (button as HTMLButtonElement).form?.requestSubmit();
  });

  await expect.poll(() => new URL(page.url()).searchParams.get("status")).toBe("created");
  const memberDrawer = page.getByTestId("member-drawer");
  await expect(memberDrawer).toBeVisible();
  await expect(memberDrawer.getByText(memberName)).toBeVisible();

  const createdParams = new URL(page.url()).searchParams;
  const personId = createdParams.get("memberId");
  if (!personId) {
    throw new Error("ID anggota baru tidak ditemukan dari query memberId.");
  }

  await page.goto(`/anggota/${personId}/edit`);
  await expect(page).toHaveURL(new RegExp(`/\\?[^#]*memberId=${personId}[^#]*edit=true`));
  await expect(page.getByText("Edit Profil Anggota")).toBeVisible();

  const editNicknameInput = page.getByPlaceholder("Contoh: Pak Ahmad").last();
  await editNicknameInput.fill(updatedNickname);
  await editNicknameInput.press("Enter");
  await expect.poll(() => new URL(page.url()).searchParams.get("status")).toBe("updated");
  await expect.poll(() => new URL(page.url()).searchParams.get("memberId")).toBe(personId);
  await expect(memberDrawer.getByText(`Panggilan: ${updatedNickname}`)).toBeVisible();

  await page.goto(`/keluarga?q=${encodeURIComponent(memberName)}`);
  await expect(page.getByText(memberName).first()).toBeVisible();
});
