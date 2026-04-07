import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[52vh] w-full flex-col items-center justify-center gap-4">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-[var(--kk-radius-xl)] border border-[color:var(--kk-border)] bg-white/80 shadow-[var(--kk-shadow-panel)]">
        <Loader2 className="h-8 w-8 animate-spin text-[color:var(--color-clay)]" />
      </div>
      <p className="animate-pulse text-lg font-medium text-[color:var(--color-bark)]">
        Memuat timeline cerita...
      </p>
    </div>
  );
}
