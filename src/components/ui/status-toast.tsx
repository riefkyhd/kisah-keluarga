"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type StatusToastProps = {
  variant: "success" | "error" | "warning";
  message: string;
};

export function StatusToast({ variant, message }: StatusToastProps) {
  const hasShownRef = useRef(false);
  const durationMs = 3200;

  useEffect(() => {
    if (!message || hasShownRef.current) {
      return;
    }

    hasShownRef.current = true;
    if (variant === "success") {
      toast.success(message, { duration: durationMs });
      return;
    }

    if (variant === "warning") {
      toast.warning(message, { duration: durationMs });
      return;
    }

    toast.error(message, { duration: durationMs });
  }, [message, variant]);

  return null;
}
