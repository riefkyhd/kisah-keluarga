"use server";

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

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function requestMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const nextPath = sanitizeNextPath(formData.get("next"));

  if (!EMAIL_PATTERN.test(email)) {
    redirect(`/login?error=invalid_email&next=${encodeURIComponent(nextPath)}`);
  }

  const callbackUrl = new URL("/callback", getAppUrl());
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
