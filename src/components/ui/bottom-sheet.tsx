"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  DialogCloseButton,
  DialogOverlay,
  DialogPortal,
  DialogPrimitive,
  useBodyScrollLock
} from "@/components/ui/dialog-base";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  useBodyScrollLock(open);
  const titleId = React.useId();

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
          forceMount
          aria-labelledby={titleId}
          className={cn(
            "fixed inset-x-0 bottom-0 z-[70] max-h-[92dvh] w-full border border-[color:rgba(212,184,150,0.4)] bg-[color:var(--kk-surface)] shadow-[var(--kk-shadow-panel)]",
            "rounded-t-[var(--kk-radius-xl)] sm:inset-x-1/2 sm:bottom-auto sm:top-1/2 sm:w-[calc(100%-2rem)] sm:max-w-lg sm:-translate-x-1/2 sm:rounded-[var(--kk-radius-xl)]",
            "kk-panel-transition transition-[transform,opacity,box-shadow]",
            "data-[state=open]:translate-y-0 data-[state=open]:opacity-100 sm:data-[state=open]:translate-y-[-50%] sm:data-[state=open]:scale-100",
            "data-[state=closed]:translate-y-full data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0 sm:data-[state=closed]:translate-y-[-50%] sm:data-[state=closed]:scale-[0.97]"
          )}
        >
          <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-[color:var(--color-sand)] sm:hidden" aria-hidden="true" />
          <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[color:rgba(212,184,150,0.4)] bg-[color:var(--kk-surface)] px-5 py-4">
            <DialogPrimitive.Title id={titleId} className="text-lg text-[color:var(--color-bark)]">
              {title}
            </DialogPrimitive.Title>
            <DialogCloseButton aria-label="Tutup panel bawah" />
          </header>
          <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">{children}</div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
}
