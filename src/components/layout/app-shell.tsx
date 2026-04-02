"use client";

import { usePathname } from "next/navigation";
import { AppNav } from "@/components/Navbar";
import type { AppRole } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  hasSession: boolean;
  userRole: AppRole | null;
};

export function AppShell({ children, hasSession, userRole }: AppShellProps) {
  const pathname = usePathname();
  const isRootCanvas = pathname === "/";

  return (
    <div className="min-h-screen bg-[color:var(--color-cream)] text-[color:var(--color-bark)]">
      <AppNav hasSession={hasSession} userRole={userRole} />

      <main
        className={cn(
          "w-full",
          isRootCanvas
            ? "mx-auto min-h-[calc(100dvh-6rem)] max-w-none px-4 pb-8 pt-4 sm:px-6 md:px-8"
            : "mx-auto min-h-[calc(100dvh-6rem)] max-w-5xl px-4 pb-10 pt-6 sm:px-6 md:pb-14 md:pt-10"
        )}
      >
        {children}
      </main>

      <footer className="border-t border-[color:rgba(212,184,150,0.4)] px-4 py-5 text-center text-sm font-normal text-[color:var(--color-clay)] sm:px-6">
        Dibangun untuk menjaga cerita keluarga tetap dekat, hangat, dan mudah diakses.
      </footer>
    </div>
  );
}
