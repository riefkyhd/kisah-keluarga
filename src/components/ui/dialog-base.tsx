"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

let bodyScrollLockCount = 0;
let previousBodyOverflow: string | null = null;

function lockBodyScroll() {
  if (typeof document === "undefined") {
    return;
  }

  if (bodyScrollLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  bodyScrollLockCount += 1;
}

function unlockBodyScroll() {
  if (typeof document === "undefined") {
    return;
  }

  bodyScrollLockCount = Math.max(0, bodyScrollLockCount - 1);
  if (bodyScrollLockCount === 0) {
    document.body.style.overflow = previousBodyOverflow ?? "";
    previousBodyOverflow = null;
  }
}

export function useBodyScrollLock(open: boolean) {
  React.useEffect(() => {
    if (!open) {
      return;
    }

    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [open]);
}

export function DialogPortal({ children }: { children: React.ReactNode }) {
  return <DialogPrimitive.Portal forceMount>{children}</DialogPrimitive.Portal>;
}

export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    forceMount
    className={cn(
      "fixed inset-0 z-[60] bg-[color:rgb(28_25_23_/_0.35)] backdrop-blur-sm kk-panel-transition",
      "data-[state=open]:opacity-100 data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export const DialogCloseButton = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Close
    ref={ref}
    className={cn(
      "inline-flex h-10 w-10 items-center justify-center rounded-[var(--kk-radius-md)] border border-[color:var(--color-sand)] bg-[color:var(--kk-surface)] text-[color:var(--color-bark)] hover:bg-[color:var(--color-warm)] focus-visible:outline-none",
      className
    )}
    {...props}
  >
    <X className="h-5 w-5" aria-hidden="true" />
    <span className="sr-only">Tutup panel</span>
  </DialogPrimitive.Close>
));
DialogCloseButton.displayName = DialogPrimitive.Close.displayName;

export { DialogPrimitive };
