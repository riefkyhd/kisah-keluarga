import type { Metadata, Viewport } from "next";
import { DM_Sans, Lora } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { AppToaster } from "@/components/ui/app-toaster";
import { appThemeColor } from "@/lib/design-tokens";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
  display: "swap"
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Kisah Keluarga",
  description: "Family hub yang hangat, sederhana, dan ramah lansia.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kisah Keluarga"
  },
  icons: {
    icon: [
      { url: "/icon", type: "image/png", sizes: "512x512" },
      { url: "/icons/icon-192", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512", type: "image/png", sizes: "512x512" },
      { url: "/icons/icon-maskable-512", type: "image/png", sizes: "512x512" }
    ],
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
    shortcut: [{ url: "/icons/icon-192", type: "image/png", sizes: "192x192" }]
  }
};

export const viewport: Viewport = {
  themeColor: appThemeColor
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${dmSans.variable} ${lora.variable}`}>
        <PwaRegister />
        <AppToaster />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
