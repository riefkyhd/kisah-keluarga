import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function sanitizeNextPath(rawValue: string | null) {
  if (!rawValue || !rawValue.startsWith("/") || rawValue.startsWith("//")) {
    return "/";
  }

  return rawValue;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = sanitizeNextPath(requestUrl.searchParams.get("next"));

  if (!code) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "callback_failed");
    loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "callback_failed");
    loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
