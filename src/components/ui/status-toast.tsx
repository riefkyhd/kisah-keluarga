"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type StatusToastProps = {
  variant: "success" | "error" | "warning";
  message: string;
};

export function StatusToast({ variant, message }: StatusToastProps) {
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (!message || hasShownRef.current) {
      return;
    }

    hasShownRef.current = true;
    if (variant === "success") {
      toast.success(message);
      return;
    }

    if (variant === "warning") {
      toast.warning(message);
      return;
    }

    toast.error(message);
  }, [message, variant]);

  return null;
}
