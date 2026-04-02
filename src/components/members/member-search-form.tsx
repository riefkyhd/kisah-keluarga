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
    <Card className="rounded-[2rem] border-stone-100 p-5 shadow-sm sm:p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="directory-search" className="text-base font-semibold text-stone-900">
            Cari nama atau panggilan
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
            <input
              id="directory-search"
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Contoh: Rina, Pak Budi, atau panggilan"
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-3.5 pl-12 pr-11 text-base text-stone-900 outline-none ring-amber-200 placeholder:text-stone-400 focus:border-amber-400 focus:ring-2"
            />
            {showSearchingIndicator ? (
              <Loader2 className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-stone-500" />
            ) : null}
          </div>
        </div>

        <p className="text-sm leading-relaxed text-stone-600">
          Hasil akan diperbarui otomatis sekitar 300ms setelah Anda berhenti mengetik.
        </p>

        <div className="flex flex-wrap gap-2">
          {hasQuery ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-stone-200 bg-white px-5 py-3 text-base font-semibold text-stone-700 transition-colors hover:bg-stone-50"
            >
              Reset
            </button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
