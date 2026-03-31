import type { Page } from "@playwright/test";
import { getMagicLinkForRole, type AppRole } from "./supabase-admin";

export async function loginAsRole(page: Page, role: AppRole, nextPath = "/keluarga") {
  const actionLink = await getMagicLinkForRole(role, nextPath);
  await page.goto(actionLink);
  await page.waitForLoadState("networkidle");
}
