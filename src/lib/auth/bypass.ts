export function isAuthBypassEnabled() {
  const raw = process.env.ENABLE_AUTH_BYPASS?.trim().toLowerCase();
  return raw === "true" || raw === "1" || raw === "yes";
}
