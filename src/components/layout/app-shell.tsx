"use client";

import { usePathname } from "next/navigation";
import { AppNav } from "@/components/Navbar";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isRootCanvas = pathname === "/";

  return (
    <div className="min-h-screen text-[color:var(--color-bark)]">
      <AppNav />

      <main
        className={cn(
          "w-full",
          isRootCanvas
            ? "mx-auto min-h-[100dvh] max-w-none px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-20 sm:min-h-[calc(100dvh-6rem)] sm:px-6 sm:pb-10 sm:pt-28 md:px-8"
            : "mx-auto min-h-[calc(100dvh-6rem)] max-w-6xl px-4 pb-10 pt-20 sm:px-6 sm:pt-28 md:pb-14"
        )}
      >
        {children}
      </main>

      {isRootCanvas ? null : (
        <footer className="border-t border-[color:rgba(212,184,150,0.4)] px-4 py-5 text-center text-sm font-normal text-[color:var(--color-clay)] sm:px-6">
          Dibangun untuk menjaga cerita keluarga tetap dekat, hangat, dan mudah diakses.
        </footer>
      )}
    </div>
  );
}
