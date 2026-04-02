const INTERNAL_BASE_URL = "http://localhost";

function normalizeInternalPath(rawValue: string | null | undefined, fallbackPath: string) {
  const value = rawValue?.trim();
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallbackPath;
  }

  try {
    const parsed = new URL(value, INTERNAL_BASE_URL);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallbackPath;
  }
}

export function sanitizeInternalReturnTo(
  rawValue: FormDataEntryValue | string | null | undefined,
  fallbackPath: string
) {
  const candidate = typeof rawValue === "string" ? rawValue : null;
  return normalizeInternalPath(candidate, fallbackPath);
}

export function withQueryParam(pathnameWithQuery: string, key: string, value: string) {
  const safePath = normalizeInternalPath(pathnameWithQuery, "/");
  const parsed = new URL(safePath, INTERNAL_BASE_URL);
  parsed.searchParams.set(key, value);
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}
