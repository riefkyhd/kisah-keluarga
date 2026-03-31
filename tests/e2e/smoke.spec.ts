import { expect, test } from "@playwright/test";
import { loginAsRole } from "./helpers/auth";

test("viewer bisa membuka direktori keluarga tanpa manual inbox click", async ({ page }) => {
  await loginAsRole(page, "viewer", "/keluarga");
  await expect(page).toHaveURL(/\/keluarga/);
  await expect(page.getByRole("heading", { name: "Daftar Anggota" })).toBeVisible();
});
