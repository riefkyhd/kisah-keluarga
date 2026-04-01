import type { Page } from "@playwright/test";
import { getPasswordCredentialsForRole, type AppRole } from "./supabase-admin";

export async function loginAsRole(page: Page, role: AppRole, nextPath = "/keluarga") {
  const credentials = await getPasswordCredentialsForRole(role);

  await page.goto(`/login?next=${encodeURIComponent(nextPath)}`);
  await page.getByLabel("Alamat Email").fill(credentials.email);
  await page.getByLabel("Kata Sandi").fill(credentials.password);
  await page.getByRole("button", { name: "Masuk ke Akun" }).click();
  await page.waitForLoadState("networkidle");
}
