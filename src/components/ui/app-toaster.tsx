"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      richColors={false}
      closeButton
      toastOptions={{
        duration: 3500,
        style: {
          border: "1px solid rgba(212,184,150,0.4)",
          borderRadius: "1rem",
          background: "#ffffff",
          color: "#4A3728"
        }
      }}
    />
  );
}
