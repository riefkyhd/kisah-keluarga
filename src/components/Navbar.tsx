"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { hasMinimumRole, type AppRole } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

type AppNavProps = {
  hasSession: boolean;
  userRole: AppRole | null;
};

type NavItem = {
  href: string;
  label: string;
};

const primaryNavItems: NavItem[] = [
  { href: "/", label: "Beranda" },
  { href: "/keluarga", label: "Keluarga" },
  { href: "/pohon", label: "Pohon" },
  { href: "/timeline", label: "Cerita" }
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

function BrandIcon() {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-[color:var(--color-sand)] bg-white shadow-sm">
      <Image
        src="/brand/kisah-keluarga-logo.png"
        alt="Logo Kisah Keluarga"
        width={36}
        height={36}
        className="h-full w-full object-cover"
        priority
      />
    </span>
  );
}

export function AppNav({ hasSession, userRole }: AppNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems =
    hasSession && userRole && hasMinimumRole(userRole, "editor")
      ? [...primaryNavItems, { href: "/admin", label: "Admin" }]
      : primaryNavItems;

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b px-4 py-3 transition-all duration-300 sm:px-6",
        isScrolled
          ? "border-[color:var(--color-sand)]/70 bg-[color:var(--color-cream)]/85 backdrop-blur-md"
          : "border-transparent bg-[color:var(--color-cream)]"
      )}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3">
          <BrandIcon />
          <div className="space-y-0.5">
            <p
              className="text-lg font-semibold leading-none text-[color:var(--color-bark)]"
              style={{ fontFamily: "var(--font-lora)" }}
            >
              Kisah Keluarga
            </p>
            <p className="text-xs text-[color:var(--color-clay)]">Ruang kenangan lintas generasi</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {navItems.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-[color:var(--color-warm)] text-[color:var(--color-bark)]"
                    : "text-[color:var(--color-clay)] hover:bg-white/80"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[color:var(--color-sand)] bg-white/70 text-[color:var(--color-bark)] sm:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="mobile-nav-menu"
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen ? (
        <nav
          id="mobile-nav-menu"
          className="mx-auto mt-3 flex w-full max-w-5xl flex-col gap-1 rounded-2xl border border-[color:var(--color-sand)] bg-white/90 p-2 shadow-sm sm:hidden"
        >
          {navItems.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-medium",
                  active
                    ? "bg-[color:var(--color-warm)] text-[color:var(--color-bark)]"
                    : "text-[color:var(--color-clay)]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}

export const Navbar = AppNav;
