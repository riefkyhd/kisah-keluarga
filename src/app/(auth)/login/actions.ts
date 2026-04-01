"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeNextPath(rawValue: FormDataEntryValue | null) {
  if (typeof rawValue !== "string") {
    return "/";
  }

  const value = rawValue.trim();
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

function getFirstHeaderValue(rawValue: string | null) {
  if (!rawValue) {
    return null;
  }

  return rawValue.split(",")[0]?.trim() || null;
}

function getAppUrl(requestHeaders: Headers) {
  const forwardedHost = getFirstHeaderValue(requestHeaders.get("x-forwarded-host"));
  const host = forwardedHost ?? getFirstHeaderValue(requestHeaders.get("host"));
  const proto = getFirstHeaderValue(requestHeaders.get("x-forwarded-proto"));

  if (host) {
    const resolvedProto = proto ?? (host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
    return `${resolvedProto}://${host}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function requestMagicLink(formData: FormData) {
  const requestHeaders = await headers();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const nextPath = sanitizeNextPath(formData.get("next"));

  if (!EMAIL_PATTERN.test(email)) {
    redirect(`/login?error=invalid_email&next=${encodeURIComponent(nextPath)}`);
  }

  const callbackUrl = new URL("/callback", getAppUrl(requestHeaders));
  callbackUrl.searchParams.set("next", nextPath);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl.toString()
    }
  });

  if (error) {
    redirect(`/login?error=send_failed&next=${encodeURIComponent(nextPath)}`);
  }

  redirect(`/login?sent=1&next=${encodeURIComponent(nextPath)}`);
}
