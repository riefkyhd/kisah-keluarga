"use client";

import { useState, type ChangeEvent } from "react";
import { Card } from "@/components/ui/card";
import { FormSubmitButton } from "@/components/ui/form-submit-button";

type MemberPhotoManagerProps = {
  personId: string;
  canManage: boolean;
  hasPhoto: boolean;
  uploadAction: (formData: FormData) => Promise<void>;
  removeAction: (formData: FormData) => Promise<void>;
};

const MAX_PHOTO_SIZE_BYTES = 4 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function MemberPhotoManager({
  personId,
  canManage,
  hasPhoto,
  uploadAction,
  removeAction
}: MemberPhotoManagerProps) {
  const [uploadError, setUploadError] = useState("");

  function handlePhotoFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) {
      setUploadError("");
      return;
    }

    if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
      setUploadError("Format foto belum didukung. Gunakan JPG, PNG, atau WEBP.");
      event.currentTarget.value = "";
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setUploadError("Ukuran foto terlalu besar. Maksimum 4MB.");
      event.currentTarget.value = "";
      return;
    }

    setUploadError("");
  }

  return (
    <Card data-testid="member-photo-manager" className="space-y-4 border-[color:rgba(212,184,150,0.4)]">
      <header className="space-y-1">
        <h3 className="text-lg text-[color:var(--color-bark)]">Foto Profil</h3>
        <p className="text-sm font-normal leading-relaxed text-[color:var(--kk-muted)]">
          Foto membantu keluarga mengenali anggota dengan lebih mudah.
        </p>
      </header>

      {canManage ? (
        <div className="space-y-3">
          <form action={uploadAction} className="space-y-3 rounded-[var(--kk-radius-md)] border border-[color:var(--color-sand)] bg-[color:var(--kk-surface)] p-4">
            <input type="hidden" name="person_id" value={personId} />
            <label className="block space-y-2 text-base font-medium text-[color:var(--color-bark)]">
              Pilih foto
              <span className="block rounded-[var(--kk-radius-md)] border-2 border-dashed border-[color:var(--color-sand)] bg-[color:var(--color-warm)] px-4 py-4">
                <input
                  data-testid="member-photo-upload-input"
                  required
                  type="file"
                  name="photo"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoFileChange}
                  className="block w-full text-sm text-[color:var(--color-bark)] file:mr-3 file:rounded-[var(--kk-radius-sm)] file:border-0 file:bg-[color:var(--color-warm)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[color:var(--color-bark)] hover:file:bg-[color:#e7dfd3]"
                />
              </span>
            </label>
            <p className="text-xs font-normal text-[color:var(--kk-muted)]">Format JPG/PNG/WEBP, ukuran maksimal 4MB.</p>
            {uploadError ? (
              <p className="rounded-[var(--kk-radius-sm)] border border-[color:#f3c7c1] bg-[color:#fdf2f0] px-3 py-2 text-sm text-[color:#9b3022]">{uploadError}</p>
            ) : null}
            <FormSubmitButton type="submit" className="w-full" pendingLabel="Memproses foto...">
              {hasPhoto ? "Ganti Foto" : "Unggah Foto"}
            </FormSubmitButton>
          </form>

          {hasPhoto ? (
            <form action={removeAction}>
              <input type="hidden" name="person_id" value={personId} />
              <FormSubmitButton type="submit" variant="danger" className="w-full" pendingLabel="Menghapus foto...">
                Hapus Foto
              </FormSubmitButton>
            </form>
          ) : null}
        </div>
      ) : (
        <p className="rounded-[var(--kk-radius-md)] border border-[color:var(--color-sand)] bg-[color:var(--color-warm)] px-4 py-3 text-sm font-normal leading-relaxed text-[color:var(--kk-muted)]">
          Hanya editor/admin yang dapat mengubah foto profil.
        </p>
      )}
    </Card>
  );
}
