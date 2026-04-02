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
    params.delete("memberId");
    params.delete("relationship_error");
    params.delete("relationship_status");
    params.delete("photo_error");
    params.delete("photo_status");
    params.delete("error");
    params.delete("status");
    params.delete("created");
    params.delete("updated");
    params.set("personId", selectedPerson.id);
    router.push(`/?${params.toString()}`);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <label className="block text-base font-medium text-[color:var(--color-bark)]">
        Fokus anggota
      </label>
      <p className="text-sm font-normal leading-relaxed text-[color:var(--kk-muted)]">
        Cari nama anggota untuk memusatkan tampilan pohon keluarga.
      </p>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex min-h-12 w-full items-center justify-between rounded-[var(--kk-radius-md)] border border-[color:var(--color-sand)] bg-[color:var(--color-warm)] px-4 py-3 text-left text-base text-[color:var(--color-bark)]"
          aria-expanded={open}
          aria-controls="tree-focus-combobox-list"
        >
          <span>{selectedPerson?.full_name ?? "Pilih anggota"}</span>
          <ChevronDown className="h-4 w-4 text-[color:var(--color-clay)]" />
        </button>

        {open ? (
          <div
            id="tree-focus-combobox-list"
            className="space-y-2 rounded-[var(--kk-radius-md)] border border-[color:rgba(212,184,150,0.4)] bg-[color:var(--kk-surface)] p-3 shadow-[var(--kk-shadow-card)]"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--kk-muted)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-[var(--kk-radius-sm)] border border-[color:var(--color-sand)] bg-[color:var(--color-warm)] py-2 pl-9 pr-3 text-sm text-[color:var(--color-bark)] outline-none focus:ring-2 focus:ring-[color:var(--kk-focus)]"
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
                      className="flex w-full items-center justify-between rounded-[var(--kk-radius-sm)] px-3 py-2 text-left text-sm text-[color:var(--color-bark)] hover:bg-[color:var(--color-warm)]"
                    >
                      <span>{candidate.full_name}</span>
                      {active ? <Check className="h-4 w-4 text-[color:var(--color-clay)]" /> : null}
                    </button>
                  </li>
                );
              })}
              {filteredCandidates.length === 0 ? (
                <li className="rounded-[var(--kk-radius-sm)] bg-[color:var(--color-warm)] px-3 py-2 text-sm font-normal text-[color:var(--kk-muted)]">
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
