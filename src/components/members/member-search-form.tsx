"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Card } from "@/components/ui/card";

type MemberSearchFormProps = {
  value: string;
};

export function MemberSearchForm({ value }: MemberSearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(value);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();

  const normalizedQuery = useMemo(
    () => query.trim().replace(/\s+/g, " ").slice(0, 80),
    [query]
  );

  useEffect(() => {
    setQuery(value);
    setIsSearching(false);
  }, [value]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const currentQuery = (searchParams.get("q") ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
      if (normalizedQuery === currentQuery) {
        setIsSearching(false);
        return;
      }

      if (normalizedQuery) {
        params.set("q", normalizedQuery);
      } else {
        params.delete("q");
      }

      params.delete("page");
      const nextQuery = params.toString();
      setIsSearching(true);
      startTransition(() => {
        router.push(nextQuery ? `/keluarga?${nextQuery}` : "/keluarga");
      });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [normalizedQuery, router, searchParams, startTransition]);

  const hasQuery = normalizedQuery.length > 0;
  const showSearchingIndicator = isPending || isSearching;

  return (
    <Card className="border-[color:rgba(212,184,150,0.4)]">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="directory-search" className="text-base font-medium text-[color:var(--color-bark)]">
            Cari nama atau panggilan
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--kk-muted)]" />
            <input
              id="directory-search"
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Contoh: Rina, Pak Budi, atau panggilan"
              className="w-full rounded-[var(--kk-radius-sm)] border border-[color:var(--color-sand)] bg-[color:var(--color-warm)] py-3 pl-12 pr-11 text-base text-[color:var(--color-bark)] outline-none placeholder:text-[color:var(--kk-muted)] focus:ring-2 focus:ring-[color:var(--kk-focus)]"
            />
            {showSearchingIndicator ? (
              <Loader2 className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[color:var(--color-clay)]" />
            ) : null}
          </div>
        </div>

        <p className="text-sm font-normal leading-relaxed text-[color:var(--kk-muted)]">
          Hasil akan diperbarui otomatis sekitar 300ms setelah Anda berhenti mengetik.
        </p>

        <div className="flex flex-wrap gap-2">
          {hasQuery ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--kk-radius-md)] border border-[color:var(--color-sand)] bg-[color:var(--kk-surface)] px-5 py-3 text-base font-medium text-[color:var(--color-clay)] hover:bg-[color:var(--color-warm)]"
            >
              Reset
            </button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
