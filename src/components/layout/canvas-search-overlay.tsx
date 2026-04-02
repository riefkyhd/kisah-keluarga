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
  const titleId = React.useId();
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
          aria-labelledby={titleId}
          className={cn(
            "fixed inset-0 z-[70] flex flex-col bg-[color:var(--kk-surface)]",
            "kk-panel-transition transition-[transform,opacity,box-shadow]",
            "data-[state=open]:opacity-100 data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0",
            "sm:inset-auto sm:right-6 sm:top-20 sm:w-[min(28rem,calc(100vw-2rem))] sm:max-h-[calc(100dvh-7rem)] sm:overflow-hidden sm:rounded-[var(--kk-radius-xl)] sm:border sm:border-[color:rgba(212,184,150,0.4)] sm:shadow-[var(--kk-shadow-panel)] sm:data-[state=open]:translate-y-0 sm:data-[state=closed]:translate-y-2"
          )}
        >
          <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[color:rgba(212,184,150,0.4)] bg-[color:var(--kk-surface)] px-5 py-4 sm:px-6">
            <DialogPrimitive.Title id={titleId} className="text-lg text-[color:var(--color-bark)]">
              Cari Anggota
            </DialogPrimitive.Title>
            <DialogCloseButton aria-label="Tutup pencarian" />
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--kk-muted)]" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari nama atau panggilan..."
                className="w-full rounded-[var(--kk-radius-sm)] border border-[color:var(--color-sand)] bg-[color:var(--color-warm)] py-3 pl-10 pr-3 text-sm text-[color:var(--color-bark)] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--kk-focus)]"
              />
            </div>

            <ul className="mt-4 space-y-2">
              {filteredMembers.map((member) => (
                <li key={member.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectMember(member.id);
                    }}
                    className="flex w-full items-center gap-3 rounded-[var(--kk-radius-md)] border border-[color:rgba(212,184,150,0.4)] bg-[color:var(--kk-surface)] px-3 py-2 text-left transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-[var(--kk-duration-fast)] ease-[var(--kk-ease-out)] hover:bg-[color:var(--color-warm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--kk-focus)]"
                  >
                    <MemberAvatar
                      fullName={member.fullName}
                      photoUrl={member.photoUrl}
                      size="sm"
                      coloredFallback
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-[color:var(--color-bark)]">
                        {member.fullName}
                      </span>
                      <span className="block truncate text-xs font-normal text-[color:var(--kk-muted)]">
                        {member.nickname ? `Panggilan: ${member.nickname}` : "Tanpa nama panggilan"}
                      </span>
                    </span>
                  </button>
                </li>
              ))}

              {filteredMembers.length === 0 ? (
                <li className="rounded-[var(--kk-radius-md)] border border-dashed border-[color:var(--color-sand)] bg-[color:var(--color-warm)] px-4 py-3 text-sm text-[color:var(--kk-muted)]">
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
