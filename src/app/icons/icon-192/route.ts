import { ImageResponse } from "next/og";
import { createBrandIconMarkup } from "@/lib/pwa/icon-template";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(createBrandIconMarkup(192), {
    width: 192,
    height: 192
  });
}
