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

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
};

export function Drawer({ open, onClose, title, children, width = "28rem" }: DrawerProps) {
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
            "fixed inset-y-0 right-0 z-[70] flex w-full max-w-full flex-col border-l border-[color:rgba(212,184,150,0.4)] bg-[color:var(--kk-surface)] shadow-[var(--kk-shadow-modal)]",
            "sm:w-[var(--drawer-width)] sm:max-w-[calc(100vw-2rem)]",
            "kk-panel-transition transition-[transform,opacity,box-shadow]",
            "data-[state=open]:translate-x-0 data-[state=open]:opacity-100 data-[state=closed]:translate-x-full data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0"
          )}
          style={{ "--drawer-width": width } as React.CSSProperties}
        >
          <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[color:rgba(212,184,150,0.4)] bg-[color:var(--kk-surface)] px-5 py-4">
            <DialogPrimitive.Title id={titleId} className="text-lg text-[color:var(--color-bark)]">
              {title}
            </DialogPrimitive.Title>
            <DialogCloseButton aria-label="Tutup drawer" />
          </header>
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">{children}</div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
}
