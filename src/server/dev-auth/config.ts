import "server-only";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const DEV_DUMMY_LOGIN_REQUIRED_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY"
] as const;

export const DEV_DUMMY_LOGIN_DEFAULT_NEXT_PATH = "/keluarga";

export type DevDummyLoginContext = {
  routeAllowed: boolean;
  envReady: boolean;
  canUse: boolean;
  missingEnv: string[];
  requestHost: string | null;
  requestOrigin: string | null;
};

function getFirstHeaderValue(rawValue: string | null) {
  if (!rawValue) {
    return null;
  }

  return rawValue.split(",")[0]?.trim() || null;
}

function getHostnameFromHostHeader(host: string | null) {
  if (!host) {
    return null;
  }

  try {
    return new URL(`http://${host}`).hostname.toLowerCase();
  } catch {
    const normalized = host.toLowerCase();
    const lastColonIndex = normalized.lastIndexOf(":");

    if (lastColonIndex <= 0) {
      return normalized;
    }

    return normalized.slice(0, lastColonIndex);
  }
}

function getMissingRequiredEnv() {
  return DEV_DUMMY_LOGIN_REQUIRED_ENV.filter((envName) => !process.env[envName]);
}

function getRequestHost(requestHeaders: Headers) {
  const forwardedHost = getFirstHeaderValue(requestHeaders.get("x-forwarded-host"));
  const host = getFirstHeaderValue(requestHeaders.get("host"));
  return forwardedHost ?? host;
}

function getRequestOrigin(requestHeaders: Headers, host: string | null) {
  if (!host) {
    return null;
  }

  const proto = getFirstHeaderValue(requestHeaders.get("x-forwarded-proto")) ?? "http";
  return `${proto}://${host}`;
}

export function sanitizeInternalNextPath(rawValue: string | null | undefined) {
  if (!rawValue) {
    return DEV_DUMMY_LOGIN_DEFAULT_NEXT_PATH;
  }

  const value = rawValue.trim();
  if (!value.startsWith("/") || value.startsWith("//")) {
    return DEV_DUMMY_LOGIN_DEFAULT_NEXT_PATH;
  }

  return value;
}

export function getDevDummyLoginContext(requestHeaders: Headers): DevDummyLoginContext {
  const host = getRequestHost(requestHeaders);
  const hostname = getHostnameFromHostHeader(host);
  const isLocalHost = Boolean(hostname && LOCAL_HOSTNAMES.has(hostname));
  const routeAllowed =
    process.env.ENABLE_DEV_DUMMY_LOGIN === "true" &&
    process.env.NODE_ENV !== "production" &&
    isLocalHost;

  const missingEnv = getMissingRequiredEnv();
  const envReady = missingEnv.length === 0;
  const requestOrigin = routeAllowed ? getRequestOrigin(requestHeaders, host) : null;

  return {
    routeAllowed,
    envReady,
    canUse: routeAllowed && envReady,
    missingEnv,
    requestHost: host,
    requestOrigin
  };
}
