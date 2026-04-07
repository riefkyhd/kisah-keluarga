"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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
    <div className={cn(
      "fixed inset-x-0 top-0 z-50 pointer-events-none transition-all duration-[var(--kk-duration-base)]",
      isScrolled ? "px-4 py-3 sm:py-4" : "px-0 py-0"
    )}>
      <header
        className={cn(
          "pointer-events-auto mx-auto flex w-full max-w-6xl items-center justify-between gap-3 transition-all duration-[var(--kk-duration-base)]",
          isScrolled
            ? "kk-glass rounded-[999px] px-6 py-3 shadow-[var(--kk-shadow-float)]"
            : "border-b border-[color:rgba(212,184,150,0.4)] bg-[color:rgb(250_247_242_/_0.88)] px-4 py-4 backdrop-blur-sm sm:px-6"
        )}
      >
        <Link href="/" className="group flex items-center gap-3">
          <BrandIcon />
          <div className="space-y-0.5">
            <p
              className="text-lg font-semibold leading-none text-[color:var(--color-bark)] transition-colors group-hover:text-[color:var(--color-clay)]"
              style={{ fontFamily: "var(--font-lora)" }}
            >
              Kisah Keluarga
            </p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[color:var(--color-clay)]">
              Ruang kenangan lintas generasi
            </p>
          </div>
        </Link>
      </header>
    </div>
  );
}

export const Navbar = AppNav;
