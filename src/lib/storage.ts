const MEMBER_PHOTO_BUCKET = "member-photos";

function stripLeadingSlash(path: string) {
  return path.replace(/^\/+/, "");
}

function encodeStoragePath(path: string) {
  return stripLeadingSlash(path)
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function getMemberPhotoPublicUrl(path?: string | null) {
  if (!path) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL wajib diisi untuk membangun URL foto publik.");
  }

  const encodedPath = encodeStoragePath(path);
  return `${supabaseUrl}/storage/v1/object/public/${MEMBER_PHOTO_BUCKET}/${encodedPath}`;
}
