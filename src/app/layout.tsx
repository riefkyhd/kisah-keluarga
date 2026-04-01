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
          <header className="border-b border-amber-200 bg-white px-4 py-4 sm:px-5">
            <div className="space-y-3">
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">Kisah Keluarga</h1>
              <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700">
                <Link className="rounded-lg px-3 py-2 hover:bg-amber-50" href="/">
                  Beranda
                </Link>
                <Link className="rounded-lg px-3 py-2 hover:bg-amber-50" href="/keluarga">
                  Keluarga
                </Link>
                <Link className="rounded-lg px-3 py-2 hover:bg-amber-50" href="/timeline">
                  Timeline
                </Link>
                <Link className="rounded-lg px-3 py-2 hover:bg-amber-50" href="/pohon">
                  Pohon
                </Link>
                <Link className="rounded-lg px-3 py-2 hover:bg-amber-50" href="/login">
                  Login
                </Link>
                <Link className="rounded-lg px-3 py-2 hover:bg-amber-50" href="/admin">
                  Admin
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 sm:px-5 sm:py-7">{children}</main>
        </div>
      </body>
    </html>
  );
}
