"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { GenerationFilterValue } from "@/lib/people";

type GenerationFilterProps = {
  selectedGeneration: GenerationFilterValue | null;
};

const generationOptions: Array<{
  label: string;
  value: GenerationFilterValue | null;
}> = [
  { label: "Semua", value: null },
  { label: "Generasi 1", value: 1 },
  { label: "Generasi 2", value: 2 },
  { label: "Generasi 3", value: 3 }
];

export function GenerationFilter({ selectedGeneration }: GenerationFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateGenerationFilter = (value: GenerationFilterValue | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("gen", String(value));
    } else {
      params.delete("gen");
    }

    params.delete("page");
    const query = params.toString();
    router.push(query ? `/keluarga?${query}` : "/keluarga");
  };

  return (
    <div className="flex flex-wrap gap-2">
      {generationOptions.map((option) => {
        const active = option.value === selectedGeneration;
        return (
          <button
            key={option.label}
            type="button"
            onClick={() => updateGenerationFilter(option.value)}
            className={cn(
              "min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "border-[color:var(--color-clay)] bg-[color:var(--color-warm)] text-[color:var(--color-bark)]"
                : "border-[color:var(--color-sand)] bg-white text-[color:var(--color-clay)] hover:bg-[color:var(--color-warm)]/60"
            )}
            aria-pressed={active}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
