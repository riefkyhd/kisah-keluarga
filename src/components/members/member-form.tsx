"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FormSubmitButton } from "@/components/ui/form-submit-button";

type MemberFormProps = {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  personId?: string;
  initialValues?: {
    full_name?: string;
    nickname?: string | null;
    gender?: string | null;
    birth_date?: string | null;
    death_date?: string | null;
    bio?: string | null;
    is_living?: boolean;
  };
};

export function MemberForm({ action, submitLabel, personId, initialValues }: MemberFormProps) {
  const [isLivingValue, setIsLivingValue] = useState(initialValues?.is_living === false ? "false" : "true");
  const [deathDateValue, setDeathDateValue] = useState(initialValues?.death_date ?? "");
  const showDeathDate = isLivingValue === "false";

  return (
    <Card className="border-[color:rgba(212,184,150,0.4)]">
      <form action={action} className="space-y-6">
        {personId ? <input type="hidden" name="person_id" value={personId} /> : null}

        <div className="space-y-4 rounded-[var(--kk-radius-md)] border border-[color:var(--color-sand)] bg-[color:var(--color-warm)] p-4 sm:p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[color:var(--color-clay)]">Identitas Dasar</p>

          <label className="block space-y-2 text-base font-medium text-[color:var(--color-bark)]">
            Nama lengkap
            <input
              required
              name="full_name"
              defaultValue={initialValues?.full_name ?? ""}
              className="w-full rounded-[var(--kk-radius-sm)] border border-[color:var(--color-sand)] bg-[color:var(--kk-surface)] px-4 py-3 text-base text-[color:var(--color-bark)] outline-none focus:ring-2 focus:ring-[color:var(--kk-focus)]"
              placeholder="Contoh: Ahmad Wijaya"
            />
          </label>

          <label className="block space-y-2 text-base font-medium text-[color:var(--color-bark)]">
            Nama panggilan (opsional)
            <input
              name="nickname"
              defaultValue={initialValues?.nickname ?? ""}
              className="w-full rounded-[var(--kk-radius-sm)] border border-[color:var(--color-sand)] bg-[color:var(--kk-surface)] px-4 py-3 text-base text-[color:var(--color-bark)] outline-none placeholder:text-[color:var(--kk-muted)] focus:ring-2 focus:ring-[color:var(--kk-focus)]"
              placeholder="Contoh: Pak Ahmad"
            />
          </label>

          <label className="block space-y-2 text-base font-medium text-[color:var(--color-bark)]">
            Jenis kelamin (opsional)
            <select
              name="gender"
              defaultValue={initialValues?.gender ?? ""}
              className="w-full rounded-[var(--kk-radius-sm)] border border-[color:var(--color-sand)] bg-[color:var(--kk-surface)] px-4 py-3 text-base text-[color:var(--color-bark)] outline-none focus:ring-2 focus:ring-[color:var(--kk-focus)]"
            >
              <option value="">Belum diisi</option>
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
              <option value="other">Lainnya</option>
            </select>
          </label>
        </div>

        <div className="space-y-4 rounded-[var(--kk-radius-md)] border border-[color:rgba(212,184,150,0.4)] bg-[color:var(--kk-surface)] p-4 sm:p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[color:var(--color-clay)]">Informasi Kehidupan</p>

          <div className={`grid grid-cols-1 gap-4 ${showDeathDate ? "sm:grid-cols-2" : ""}`}>
            <label className="block space-y-2 text-base font-medium text-[color:var(--color-bark)]">
              Tanggal lahir (opsional)
              <input
                type="date"
                name="birth_date"
                defaultValue={initialValues?.birth_date ?? ""}
                className="w-full rounded-[var(--kk-radius-sm)] border border-[color:var(--color-sand)] bg-[color:var(--color-warm)] px-4 py-3 text-base text-[color:var(--color-bark)] outline-none focus:ring-2 focus:ring-[color:var(--kk-focus)]"
              />
            </label>

            {showDeathDate ? (
              <label className="block space-y-2 text-base font-medium text-[color:var(--color-bark)]">
                Tanggal wafat (opsional)
                <input
                  type="date"
                  name="death_date"
                  value={deathDateValue}
                  onChange={(event) => setDeathDateValue(event.target.value)}
                  className="w-full rounded-[var(--kk-radius-sm)] border border-[color:var(--color-sand)] bg-[color:var(--color-warm)] px-4 py-3 text-base text-[color:var(--color-bark)] outline-none focus:ring-2 focus:ring-[color:var(--kk-focus)]"
                />
              </label>
            ) : (
              <input type="hidden" name="death_date" value="" />
            )}
          </div>

          <label className="block space-y-2 text-base font-medium text-[color:var(--color-bark)]">
            Status kehidupan
            <select
              name="is_living"
              value={isLivingValue}
              onChange={(event) => {
                const nextValue = event.target.value;
                setIsLivingValue(nextValue);
                if (nextValue === "true") {
                  setDeathDateValue("");
                }
              }}
              className="w-full rounded-[var(--kk-radius-sm)] border border-[color:var(--color-sand)] bg-[color:var(--color-warm)] px-4 py-3 text-base text-[color:var(--color-bark)] outline-none focus:ring-2 focus:ring-[color:var(--kk-focus)]"
            >
              <option value="true">Masih hidup</option>
              <option value="false">Sudah wafat</option>
            </select>
          </label>
        </div>

        <div className="space-y-3">
          <label className="block space-y-2 text-base font-medium text-[color:var(--color-bark)]">
            Catatan singkat (opsional)
            <textarea
              name="bio"
              defaultValue={initialValues?.bio ?? ""}
              rows={4}
              className="w-full rounded-[var(--kk-radius-sm)] border border-[color:var(--color-sand)] bg-[color:var(--color-warm)] px-4 py-3 text-base text-[color:var(--color-bark)] outline-none placeholder:text-[color:var(--kk-muted)] focus:ring-2 focus:ring-[color:var(--kk-focus)]"
              placeholder="Catatan keluarga singkat..."
            />
          </label>

          <p className="text-sm font-normal leading-relaxed text-[color:var(--kk-muted)]">
            Isi data dasar terlebih dahulu. Detail lainnya bisa diperbarui kapan saja dari profil anggota.
          </p>
        </div>

        <FormSubmitButton type="submit" className="w-full" pendingLabel="Menyimpan...">
          {submitLabel}
        </FormSubmitButton>
      </form>
    </Card>
  );
}
