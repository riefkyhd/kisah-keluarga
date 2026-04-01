import { expect, test } from "@playwright/test";

test.skip(
  process.env.ENABLE_DEV_DUMMY_LOGIN === "true",
  "Spec ini khusus untuk mode dev dummy login disabled."
);

test("dev-login hard-deny saat fitur dimatikan dan link tidak tampil di login", async ({ page }) => {
  const response = await page.goto("/dev-login");
  expect(response?.status()).toBe(404);

  await page.goto("/login");
  await expect(page.getByRole("link", { name: "Buka Mode Pengujian Lokal" })).toHaveCount(0);
});
