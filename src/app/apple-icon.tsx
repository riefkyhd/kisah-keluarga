import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = {
  width: 180,
  height: 180
};

export const contentType = "image/png";

export default async function AppleIcon() {
  const icon = await readFile(join(process.cwd(), "public", "icons", "apple-touch-icon.png"));
  return new Response(new Uint8Array(icon), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
