import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { PwaRegister } from "@/components/pwa/pwa-register";
import "./globals.css";

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
  themeColor: "#f9f7f4"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <PwaRegister />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
