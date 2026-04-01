import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDevDummyLoginContext, sanitizeInternalNextPath } from "@/server/dev-auth/config";
import { generateRoleLoginLink, isDummyRole } from "@/server/dev-auth/dummy-login";

type DevLoginRouteError = "invalid_form" | "env_missing" | "bootstrap_failed";

function redirectToDevLoginError(requestUrl: URL, error: DevLoginRouteError, nextPath?: string) {
  const redirectUrl = new URL("/dev-login", requestUrl.origin);
  redirectUrl.searchParams.set("error", error);

  if (nextPath) {
    redirectUrl.searchParams.set("next", sanitizeInternalNextPath(nextPath));
  }

  return NextResponse.redirect(redirectUrl);
}

export async function GET(request: NextRequest) {
  const requestHeaders = await headers();
  const context = getDevDummyLoginContext(requestHeaders);

  if (!context.routeAllowed) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const nextPath = sanitizeInternalNextPath(request.nextUrl.searchParams.get("next"));
  const roleValue = String(request.nextUrl.searchParams.get("role") ?? "");

  if (!context.envReady || !context.requestOrigin) {
    return redirectToDevLoginError(request.nextUrl, "env_missing", nextPath);
  }

  if (!isDummyRole(roleValue)) {
    return redirectToDevLoginError(request.nextUrl, "invalid_form", nextPath);
  }

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Lanjutkan bootstrap login meski proses signout gagal.
  }

  let actionLink: string;
  try {
    actionLink = await generateRoleLoginLink(roleValue, nextPath, context.requestOrigin);
  } catch {
    return redirectToDevLoginError(request.nextUrl, "bootstrap_failed", nextPath);
  }

  return NextResponse.redirect(actionLink);
}
