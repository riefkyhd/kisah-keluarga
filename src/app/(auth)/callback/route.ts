import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

function sanitizeNextPath(rawValue: string | null) {
  if (!rawValue || !rawValue.startsWith("/") || rawValue.startsWith("//")) {
    return "/";
  }

  return rawValue;
}

function getOtpType(rawValue: string | null): EmailOtpType | null {
  if (!rawValue) {
    return null;
  }

  const validTypes: EmailOtpType[] = ["email", "recovery", "invite", "magiclink", "email_change"];
  return validTypes.includes(rawValue as EmailOtpType) ? (rawValue as EmailOtpType) : null;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const otpType = getOtpType(requestUrl.searchParams.get("type"));
  const nextPath = sanitizeNextPath(requestUrl.searchParams.get("next"));

  if (!code && !(tokenHash && otpType)) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "callback_failed");
    loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({
        token_hash: tokenHash!,
        type: otpType!
      });

  if (error) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "callback_failed");
    loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
