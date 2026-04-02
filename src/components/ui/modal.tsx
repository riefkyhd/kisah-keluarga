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

type ModalSize = "sm" | "md" | "lg";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: ModalSize;
};

const sizeClassMap: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl"
};

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
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
          aria-labelledby={titleId}
          className={cn(
            "fixed left-1/2 top-1/2 z-[70] w-[calc(100%-2rem)] -translate-x-1/2 border border-[color:rgba(212,184,150,0.4)] bg-[color:var(--kk-surface)] shadow-[var(--kk-shadow-panel)]",
            "max-h-[calc(100dvh-2rem)] rounded-[var(--kk-radius-xl)]",
            "kk-panel-transition transition-[transform,opacity,box-shadow]",
            "data-[state=open]:translate-y-[-50%] data-[state=open]:scale-100 data-[state=open]:opacity-100",
            "data-[state=closed]:translate-y-[calc(-50%+8px)] data-[state=closed]:scale-[0.97] data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0",
            sizeClassMap[size]
          )}
        >
          <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[color:rgba(212,184,150,0.4)] bg-[color:var(--kk-surface)] px-5 py-4">
            <DialogPrimitive.Title id={titleId} className="text-lg text-[color:var(--color-bark)]">
              {title}
            </DialogPrimitive.Title>
            <DialogCloseButton aria-label="Tutup modal" />
          </header>
          <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">{children}</div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
}
