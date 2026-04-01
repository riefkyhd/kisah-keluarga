import "server-only";

import sharp from "sharp";

const PROFILE_PHOTO_MAX_DIMENSION = 768;
const PROFILE_PHOTO_WEBP_QUALITY = 82;

export type OptimizedProfilePhoto = {
  bytes: Uint8Array;
  contentType: "image/webp";
  extension: "webp";
};

export async function optimizeProfilePhoto(rawBytes: Uint8Array): Promise<OptimizedProfilePhoto> {
  const outputBuffer = await sharp(rawBytes, { failOn: "none" })
    .rotate()
    .resize({
      width: PROFILE_PHOTO_MAX_DIMENSION,
      height: PROFILE_PHOTO_MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true
    })
    .webp({
      quality: PROFILE_PHOTO_WEBP_QUALITY,
      effort: 4
    })
    .toBuffer();

  if (outputBuffer.length === 0) {
    throw new Error("Optimized profile photo is empty.");
  }

  return {
    bytes: new Uint8Array(outputBuffer),
    contentType: "image/webp",
    extension: "webp"
  };
}
