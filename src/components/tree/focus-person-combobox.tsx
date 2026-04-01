"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Search } from "lucide-react";
import type { TreeFocusPerson } from "@/server/queries/relationships";
import { Button } from "@/components/ui/button";

type FocusPersonComboboxProps = {
  candidates: TreeFocusPerson[];
  selectedPersonId: string;
};

export function FocusPersonCombobox({
  candidates,
  selectedPersonId
}: FocusPersonComboboxProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(selectedPersonId);

  const selectedPerson =
    candidates.find((candidate) => candidate.id === selectedId) ?? candidates[0] ?? null;
  const filteredCandidates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return candidates.slice(0, 8);
    }

    return candidates
      .filter((candidate) => candidate.full_name.toLowerCase().includes(normalizedQuery))
      .slice(0, 8);
  }, [candidates, query]);

  const applySelection = () => {
    if (!selectedPerson) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("personId", selectedPerson.id);
    router.push(`/pohon?${params.toString()}`);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <label className="block text-base font-semibold text-stone-900">
        Fokus anggota
      </label>
      <p className="text-sm leading-relaxed text-stone-600">
        Cari nama anggota untuk memusatkan tampilan pohon keluarga.
      </p>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex min-h-12 w-full items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-left text-base text-stone-900"
          aria-expanded={open}
          aria-controls="tree-focus-combobox-list"
        >
          <span>{selectedPerson?.full_name ?? "Pilih anggota"}</span>
          <ChevronDown className="h-4 w-4 text-stone-500" />
        </button>

        {open ? (
          <div
            id="tree-focus-combobox-list"
            className="space-y-2 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-sm text-stone-900 outline-none ring-amber-200 focus:border-amber-400 focus:ring-2"
                placeholder="Ketik nama anggota..."
              />
            </div>
            <ul className="max-h-60 space-y-1 overflow-y-auto">
              {filteredCandidates.map((candidate) => {
                const active = candidate.id === selectedPerson?.id;
                return (
                  <li key={candidate.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(candidate.id);
                        setQuery(candidate.full_name);
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-stone-800 hover:bg-stone-50"
                    >
                      <span>{candidate.full_name}</span>
                      {active ? <Check className="h-4 w-4 text-amber-700" /> : null}
                    </button>
                  </li>
                );
              })}
              {filteredCandidates.length === 0 ? (
                <li className="rounded-xl bg-stone-50 px-3 py-2 text-sm text-stone-600">
                  Tidak ada anggota yang cocok.
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </div>

      <Button type="button" onClick={applySelection}>
        Tampilkan Pohon
      </Button>
    </div>
  );
}
