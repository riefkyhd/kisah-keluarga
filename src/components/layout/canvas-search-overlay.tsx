"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { MemberAvatar } from "@/components/members/member-avatar";
import {
  DialogCloseButton,
  DialogOverlay,
  DialogPortal,
  DialogPrimitive,
  useBodyScrollLock
} from "@/components/ui/dialog-base";
import { cn } from "@/lib/utils";

export type CanvasSearchItem = {
  id: string;
  fullName: string;
  nickname: string | null;
  photoUrl: string | null;
};

type CanvasSearchOverlayProps = {
  open: boolean;
  onClose: () => void;
  members: CanvasSearchItem[];
  onSelectMember: (personId: string) => void;
};

export function CanvasSearchOverlay({
  open,
  onClose,
  members,
  onSelectMember
}: CanvasSearchOverlayProps) {
  useBodyScrollLock(open);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredMembers = React.useMemo(() => {
    if (!normalizedQuery) {
      return members.slice(0, 24);
    }

    return members
      .filter((member) => {
        const nickname = member.nickname?.toLowerCase() ?? "";
        return (
          member.fullName.toLowerCase().includes(normalizedQuery) ||
          nickname.includes(normalizedQuery)
        );
      })
      .slice(0, 24);
  }, [members, normalizedQuery]);

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            "fixed inset-0 z-[70] flex flex-col bg-[color:var(--kk-surface)]",
            "kk-panel-transition transition-[transform,opacity,box-shadow]",
            "data-[state=open]:opacity-100 data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0",
            "sm:inset-auto sm:right-6 sm:top-20 sm:w-[min(28rem,calc(100vw-2rem))] sm:max-h-[calc(100dvh-7rem)] sm:overflow-hidden sm:rounded-[var(--kk-radius-xl)] sm:border sm:border-[color:rgba(212,184,150,0.4)] sm:shadow-[var(--kk-shadow-panel)] sm:data-[state=open]:translate-y-0 sm:data-[state=closed]:translate-y-2"
          )}
        >
          <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[color:var(--kk-border)] bg-[color:rgb(255_255_255_/_0.96)] px-5 py-4 backdrop-blur-sm sm:px-6">
            <DialogPrimitive.Title className="text-xl font-semibold text-[color:var(--color-bark)]">
              Cari Anggota
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Form pencarian anggota keluarga
            </DialogPrimitive.Description>
            <DialogCloseButton aria-label="Tutup pencarian" />
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--kk-muted)]" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari nama atau panggilan..."
                className="w-full rounded-[var(--kk-radius-md)] border border-[color:var(--kk-border)] bg-[color:var(--color-warm)] py-4 pl-12 pr-4 text-lg font-normal text-[color:var(--color-bark)] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--kk-focus)] transition-all"
              />
            </div>

            <ul className="mt-6 space-y-3">
              {filteredMembers.map((member) => (
                <li key={member.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectMember(member.id);
                    }}
                    className="flex min-h-16 w-full items-center gap-4 rounded-[var(--kk-radius-md)] border border-[color:var(--kk-border)] bg-[color:var(--kk-surface)] px-4 py-3 text-left transition-all hover:bg-[color:var(--color-warm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--kk-focus)] active:scale-[0.99]"
                  >
                    <MemberAvatar
                      fullName={member.fullName}
                      photoUrl={member.photoUrl}
                      size="sm"
                      coloredFallback
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base font-medium text-[color:var(--color-bark)]">
                        {member.fullName}
                      </span>
                      <span className="block truncate text-sm font-normal text-[color:var(--color-clay)]">
                        {member.nickname ? `Panggilan: ${member.nickname}` : "Tanpa nama panggilan"}
                      </span>
                    </span>
                  </button>
                </li>
              ))}

              {filteredMembers.length === 0 ? (
                <li className="rounded-[var(--kk-radius-md)] border-2 border-dashed border-[color:var(--kk-border)] bg-[color:var(--color-warm)] px-6 py-5 text-base font-normal text-[color:var(--kk-muted)] text-center">
                  Anggota tidak ditemukan. Coba kata kunci lain.
                </li>
              ) : null}
            </ul>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
}
