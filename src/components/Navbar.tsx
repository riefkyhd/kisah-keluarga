"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

function BrandIcon() {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-[var(--kk-radius-md)] border border-[color:var(--color-sand)] bg-[color:var(--kk-surface)] shadow-[var(--kk-shadow-soft)]">
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

export function AppNav() {
  const pathname = usePathname();
  const isRootCanvas = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);

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
        "kk-panel-transition sticky top-0 z-50 border-b px-4 py-3 sm:px-6",
        isRootCanvas ? "hidden sm:block" : "",
        isScrolled
          ? "border-[color:rgba(212,184,150,0.4)] bg-[color:var(--color-cream)]/90 backdrop-blur-md"
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
      </div>
    </header>
  );
}

export const Navbar = AppNav;
