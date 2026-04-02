"use client";

import Link from "next/link";
import { Ellipsis, Plus, Search, Target } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FocusPersonCombobox } from "@/components/tree/focus-person-combobox";
import { CanvasSearchOverlay, type CanvasSearchItem } from "@/components/layout/canvas-search-overlay";
import { MemberCreateSheetShell } from "@/components/members/member-create-sheet-shell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  buildCanvasHref,
  CANVAS_FEEDBACK_QUERY_KEYS,
  clearCanvasKeys,
  cloneCanvasParams,
  ensureCanvasFocus
} from "@/lib/canvas/query-state";
import type { MemberMutationResult } from "@/server/actions/members";
import type { TreeFocusPerson } from "@/server/queries/relationships";
import { logoutAction } from "@/server/actions/auth";

export type { CanvasSearchItem } from "@/components/layout/canvas-search-overlay";

type CanvasToolbarProps = {
  canManageMembers: boolean;
  canManageUsers: boolean;
  showLogout: boolean;
  focusCandidates: TreeFocusPerson[];
  selectedFocusPersonId: string;
  focusPersonId: string;
  searchMembers: CanvasSearchItem[];
  createAction: (formData: FormData) => Promise<MemberMutationResult | void>;
};

export function CanvasToolbar({
  canManageMembers,
  canManageUsers,
  showLogout,
  focusCandidates,
  selectedFocusPersonId,
  focusPersonId,
  searchMembers,
  createAction
}: CanvasToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);

  const openAddMember = () => {
    const params = cloneCanvasParams(searchParams);
    clearCanvasKeys(params, CANVAS_FEEDBACK_QUERY_KEYS);
    ensureCanvasFocus(params, focusPersonId);
    params.delete("memberId");
    params.delete("edit");
    params.set("action", "add");
    router.push(buildCanvasHref(params), { scroll: false });
  };

  const handleSelectSearchMember = (personId: string) => {
    const params = cloneCanvasParams(searchParams);
    clearCanvasKeys(params, CANVAS_FEEDBACK_QUERY_KEYS);
    params.set("personId", personId);
    params.set("memberId", personId);
    params.delete("edit");
    params.delete("action");
    router.push(buildCanvasHref(params), { scroll: false });
    setSearchOpen(false);
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:hidden">
        <div className="pointer-events-auto mx-auto flex max-w-5xl items-center justify-between gap-2 rounded-[999px] border border-[color:rgba(212,184,150,0.4)] bg-[color:var(--kk-surface)] p-2 shadow-[0_4px_24px_rgba(28,25,23,0.14)]">
          <Button type="button" variant="outline" size="icon" aria-label="Cari anggota" onClick={() => setSearchOpen(true)}>
            <Search className="h-4 w-4" />
          </Button>
          {canManageMembers ? (
            <Button type="button" variant="outline" size="icon" aria-label="Tambah anggota" onClick={openAddMember}>
              <Plus className="h-4 w-4" />
            </Button>
          ) : null}
          <Button type="button" variant="outline" size="icon" aria-label="Pilih fokus anggota" onClick={() => setFocusOpen((value) => !value)}>
            <Target className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="icon" aria-label="Menu lainnya">
                <Ellipsis className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <ToolbarMenuItems canManageUsers={canManageUsers} showLogout={showLogout} />
          </DropdownMenu>
        </div>
      </div>

      <div className="pointer-events-none fixed right-6 top-20 z-40 hidden sm:block">
        <div className="pointer-events-auto flex items-center gap-2 rounded-[999px] border border-[color:rgba(212,184,150,0.4)] bg-[color:var(--kk-surface)] p-2 shadow-[0_4px_24px_rgba(28,25,23,0.14)]">
          <Button type="button" variant="outline" size="sm" onClick={() => setSearchOpen(true)}>
            <Search className="h-4 w-4" />
            Search
          </Button>
          {canManageMembers ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Tambah Anggota"
              onClick={openAddMember}
            >
              <Plus className="h-4 w-4" />
              Tambah Anggota
            </Button>
          ) : null}
          <Button type="button" variant="outline" size="sm" onClick={() => setFocusOpen((value) => !value)}>
            <Target className="h-4 w-4" />
            Fokus
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <Ellipsis className="h-4 w-4" />
                Menu
              </Button>
            </DropdownMenuTrigger>
            <ToolbarMenuItems canManageUsers={canManageUsers} showLogout={showLogout} />
          </DropdownMenu>
        </div>
      </div>

      {focusOpen ? (
        <div className="fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 sm:inset-x-auto sm:right-6 sm:top-[4.75rem] sm:bottom-auto sm:w-[22rem]">
          <div className="rounded-[var(--kk-radius-xl)] border border-[color:rgba(212,184,150,0.4)] bg-[color:var(--kk-surface)] p-3 shadow-[var(--kk-shadow-panel)] sm:p-4">
            <FocusPersonCombobox
              candidates={focusCandidates}
              selectedPersonId={selectedFocusPersonId}
              variant="toolbar"
              onApplied={() => setFocusOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <MemberCreateSheetShell
        canManage={canManageMembers}
        focusPersonId={focusPersonId}
        createAction={createAction}
        showTrigger={false}
      />

      <CanvasSearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        members={searchMembers}
        onSelectMember={handleSelectSearchMember}
      />
    </>
  );
}

function ToolbarMenuItems({
  canManageUsers,
  showLogout
}: {
  canManageUsers: boolean;
  showLogout: boolean;
}) {
  return (
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuItem asChild>
        <Link href="/keluarga">Direktori Keluarga</Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/timeline">Timeline Cerita</Link>
      </DropdownMenuItem>
      {canManageUsers ? (
        <DropdownMenuItem asChild>
          <Link href="/admin/pengguna">Kelola Pengguna</Link>
        </DropdownMenuItem>
      ) : null}
      {showLogout ? (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <form action={logoutAction} className="w-full">
              <button type="submit" className="w-full text-left">
                Keluar
              </button>
            </form>
          </DropdownMenuItem>
        </>
      ) : null}
    </DropdownMenuContent>
  );
}
