"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Heart, Home, LogOut, Settings, TreeDeciduous, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type AppShellProps = {
  children: React.ReactNode;
};

type NavItem = {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

const desktopNavItems: NavItem[] = [
  { href: "/", label: "Beranda" },
  { href: "/keluarga", label: "Keluarga" },
  { href: "/pohon", label: "Pohon" },
  { href: "/timeline", label: "Cerita" },
  { href: "/admin", label: "Admin" }
];

const mobileNavItems: NavItem[] = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/keluarga", label: "Keluarga", icon: Users },
  { href: "/pohon", label: "Pohon", icon: TreeDeciduous },
  { href: "/timeline", label: "Cerita", icon: BookOpen }
];

function isNavActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/timeline") {
    return pathname.startsWith("/timeline") || pathname.startsWith("/cerita");
  }

  return pathname.startsWith(href);
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F9F7F4] pb-24 text-stone-800 md:pb-0">
      <header className="sticky top-0 z-50 hidden border-b border-stone-200/60 bg-white/80 px-8 py-4 backdrop-blur-md md:flex md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-amber-100 p-2">
            <Heart className="h-5 w-5 fill-amber-700 text-amber-700" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-stone-900">Kisah Keluarga</span>
        </div>

        <nav className="flex items-center gap-1">
          {desktopNavItems.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                  active ? "bg-amber-50 text-amber-800" : "text-stone-600 hover:bg-stone-100"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <Link href="/admin" aria-label="Buka halaman admin">
            <Button variant="ghost" size="icon" className="text-stone-500">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login" aria-label="Buka halaman login">
            <Button variant="ghost" size="icon" className="text-stone-500">
              <LogOut className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto min-h-[100dvh] w-full max-w-3xl px-4 pb-8 pt-6 md:px-8 md:pb-12 md:pt-12">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-100 bg-white/95 pb-2 pt-2 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] backdrop-blur-lg md:hidden">
        <div className="flex h-20 items-center justify-around px-2">
          {mobileNavItems.map((item) => {
            const active = isNavActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex h-full w-full flex-col items-center justify-center gap-1"
              >
                <div
                  className={cn(
                    "rounded-2xl p-2 transition-all duration-300",
                    active ? "scale-110 bg-amber-100 text-amber-800" : "text-stone-400"
                  )}
                >
                  {Icon ? <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} /> : null}
                </div>
                <span className={cn("text-[10px] font-medium", active ? "text-amber-800" : "text-stone-500")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
