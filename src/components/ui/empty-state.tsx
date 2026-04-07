"use client";

import { Info } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  className?: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, className, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--kk-radius-xl)] border-2 border-dashed border-[color:var(--color-sand)] bg-[color:var(--color-warm)]/30 p-10 text-center shadow-[var(--kk-shadow-soft)] transition-all",
        className
      )}
    >
      <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md text-[color:var(--color-clay)]">
        <Info className="h-8 w-8" />
      </div>
      <h3 className="text-2xl font-bold text-[color:var(--color-bark)]">{title}</h3>
      <p className="mt-3 max-w-lg text-lg font-medium leading-relaxed text-[color:var(--kk-muted)]">{description}</p>
      {action ? <div className="mt-8">{action}</div> : null}
    </motion.div>
  );
}
