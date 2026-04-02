"use client";

import { AppNav } from "@/components/Navbar";
import type { AppRole } from "@/lib/auth/roles";

type AppShellProps = {
  children: React.ReactNode;
  hasSession: boolean;
  userRole: AppRole | null;
};

export function AppShell({ children, hasSession, userRole }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[color:var(--color-cream)] text-[color:var(--color-bark)]">
      <AppNav hasSession={hasSession} userRole={userRole} />

      <main className="mx-auto min-h-[calc(100dvh-6rem)] w-full max-w-5xl px-4 pb-10 pt-6 sm:px-6 md:pb-14 md:pt-10">
        {children}
      </main>

      <footer className="border-t border-[color:var(--color-sand)]/60 px-4 py-5 text-center text-sm text-[color:var(--color-clay)] sm:px-6">
        Dibangun untuk menjaga cerita keluarga tetap dekat, hangat, dan mudah diakses.
      </footer>
    </div>
  );
}
