import { ImageResponse } from "next/og";
import { createBrandIconMarkup } from "@/lib/pwa/icon-template";

export const size = {
  width: 512,
  height: 512
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(createBrandIconMarkup(512), {
    ...size
  });
}
