"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MemberCreateSheet } from "@/components/members/member-create-sheet";
import type { MemberMutationResult } from "@/server/actions/members";

type MemberCreateSheetShellProps = {
  canManage: boolean;
  focusPersonId: string;
  createAction: (formData: FormData) => Promise<MemberMutationResult | void>;
};

const CLEANUP_KEYS = ["action", "error", "status", "created", "updated"] as const;

export function MemberCreateSheetShell({
  canManage,
  focusPersonId,
  createAction
}: MemberCreateSheetShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOpen = canManage && searchParams.get("action") === "add";

  const pushCanvasState = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!params.get("personId") && focusPersonId) {
      params.set("personId", focusPersonId);
    }

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
        return;
      }

      params.set(key, value);
    });

    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : "/", { scroll: false });
  };

  if (!canManage) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          const updates = Object.fromEntries(CLEANUP_KEYS.map((key) => [key, null]));
          pushCanvasState({
            ...updates,
            action: "add"
          });
        }}
        className="inline-flex min-h-12 items-center justify-center rounded-[var(--kk-radius-md)] border border-[color:var(--color-sand)] bg-[color:var(--kk-surface)] px-4 py-3 text-sm font-medium text-[color:var(--color-bark)] hover:bg-[color:var(--color-warm)]"
      >
        Tambah Anggota
      </button>

      <MemberCreateSheet
        open={isOpen}
        onClose={() => pushCanvasState({ action: null })}
        onSuccess={(personId) => {
          const updates = Object.fromEntries(CLEANUP_KEYS.map((key) => [key, null]));
          pushCanvasState({
            ...updates,
            memberId: personId,
            status: "created"
          });
        }}
        createAction={createAction}
      />
    </>
  );
}
