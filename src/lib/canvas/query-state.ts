export const CANVAS_FEEDBACK_QUERY_KEYS = [
  "relationship_error",
  "relationship_status",
  "photo_error",
  "photo_status",
  "error",
  "status",
  "created",
  "updated"
] as const;

export const CANVAS_UI_QUERY_KEYS = ["memberId", "edit", "action"] as const;

export const CANVAS_TRANSIENT_QUERY_KEYS = [
  ...CANVAS_FEEDBACK_QUERY_KEYS,
  ...CANVAS_UI_QUERY_KEYS
] as const;

type SearchParamsLike = { toString(): string } | URLSearchParams;

export function cloneCanvasParams(input: SearchParamsLike) {
  return new URLSearchParams(input.toString());
}

export function clearCanvasKeys(params: URLSearchParams, keys: readonly string[]) {
  keys.forEach((key) => {
    params.delete(key);
  });

  return params;
}

export function ensureCanvasFocus(params: URLSearchParams, personId?: string | null) {
  const normalized = sanitizeCanvasId(personId);
  if (!normalized) {
    return params;
  }

  if (!params.get("personId")) {
    params.set("personId", normalized);
  }

  return params;
}

export function buildCanvasHref(params: URLSearchParams) {
  const queryString = params.toString();
  return queryString ? `/?${queryString}` : "/";
}

export function sanitizeCanvasId(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.trim();
}

export function updateCanvasParams(
  input: SearchParamsLike,
  updates: Record<string, string | null>,
  fallbackFocusPersonId?: string | null
) {
  const params = cloneCanvasParams(input);
  ensureCanvasFocus(params, fallbackFocusPersonId);

  Object.entries(updates).forEach(([key, value]) => {
    if (value === null) {
      params.delete(key);
      return;
    }

    params.set(key, value);
  });

  return params;
}
