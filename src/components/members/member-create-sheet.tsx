"use client";

import { useMemo, useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { StatusBanner } from "@/components/ui/status-banner";
import { MemberForm } from "@/components/members/member-form";
import type { MemberMutationResult } from "@/server/actions/members";

type MemberCreateSheetProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: (personId: string) => void;
  createAction: (formData: FormData) => Promise<MemberMutationResult | void>;
};

const createErrorMessages: Record<string, string> = {
  invalid_form: "Data belum lengkap atau belum valid. Mohon periksa kembali.",
  save_failed: "Data belum tersimpan. Coba lagi sebentar."
};

export function MemberCreateSheet({ open, onClose, onSuccess, createAction }: MemberCreateSheetProps) {
  const [submitError, setSubmitError] = useState("");
  const helperDescription = useMemo(
    () =>
      "Isi data dasar dulu agar proses cepat dan mudah dipahami. Detail lain dapat ditambahkan nanti dari profil anggota.",
    []
  );

  return (
    <BottomSheet open={open} onClose={onClose} title="Tambah Anggota Baru">
      <div className="space-y-4">
        <p className="text-sm font-normal leading-relaxed text-[color:var(--kk-muted)]">{helperDescription}</p>
        {submitError ? <StatusBanner variant="error" message={submitError} /> : null}
        <MemberForm
          action={createAction}
          submitLabel="Simpan Anggota"
          actionMode="result"
          onActionResult={(result) => {
            if (result.ok) {
              setSubmitError("");
              onSuccess(result.personId);
              return;
            }

            setSubmitError(createErrorMessages[result.error] ?? "Data belum tersimpan. Coba lagi sebentar.");
          }}
        />
      </div>
    </BottomSheet>
  );
}
