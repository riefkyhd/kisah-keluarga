import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-4">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-[var(--kk-radius-xl)] border-2 border-[color:var(--color-sand)] bg-white/60 shadow-[var(--kk-shadow-float)] backdrop-blur-md">
        <Loader2 className="h-8 w-8 animate-spin text-[color:var(--color-clay)]" />
      </div>
      <p className="text-lg font-bold text-[color:var(--color-bark)] animate-pulse">
        Memuat dashboard admin...
      </p>
    </div>
  );
}