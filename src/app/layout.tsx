import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kisah Keluarga",
  description: "Family hub yang hangat, sederhana, dan ramah lansia."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col">
          <header className="border-b border-amber-200 bg-white px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-lg font-semibold">Kisah Keluarga</h1>
              <nav className="flex items-center gap-4 text-sm text-slate-700">
                <Link href="/">Beranda</Link>
                <Link href="/keluarga">Keluarga</Link>
                <Link href="/timeline">Timeline</Link>
                <Link href="/pohon">Pohon</Link>
                <Link href="/login">Login</Link>
                <Link href="/admin">Admin</Link>
              </nav>
            </div>
          </header>
          <main className="flex-1 px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
