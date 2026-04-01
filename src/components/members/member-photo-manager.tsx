type MemberPhotoManagerProps = {
  personId: string;
  canManage: boolean;
  hasPhoto: boolean;
  uploadAction: (formData: FormData) => Promise<void>;
  removeAction: (formData: FormData) => Promise<void>;
};

export function MemberPhotoManager({
  personId,
  canManage,
  hasPhoto,
  uploadAction,
  removeAction
}: MemberPhotoManagerProps) {
  return (
    <section data-testid="member-photo-manager" className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <h3 className="text-lg font-semibold text-slate-900">Foto Profil</h3>
      <p className="text-sm leading-relaxed text-slate-700">
        Foto membantu keluarga mengenali anggota dengan lebih mudah.
      </p>

      {canManage ? (
        <div className="space-y-3">
          <form action={uploadAction} className="space-y-3">
            <input type="hidden" name="person_id" value={personId} />
            <label className="block space-y-2 text-base font-semibold text-slate-800">
              Pilih foto
              <input
                data-testid="member-photo-upload-input"
                required
                type="file"
                name="photo"
                accept="image/png,image/jpeg,image/webp"
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-lg bg-amber-500 px-4 py-3 text-base font-semibold text-white"
            >
              {hasPhoto ? "Ganti Foto" : "Unggah Foto"}
            </button>
          </form>

          {hasPhoto ? (
            <form action={removeAction}>
              <input type="hidden" name="person_id" value={personId} />
              <button
                type="submit"
                className="w-full rounded-lg border border-rose-300 bg-white px-4 py-3 text-base font-semibold text-rose-700"
              >
                Hapus Foto
              </button>
            </form>
          ) : null}
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-slate-600">Hanya editor/admin yang dapat mengubah foto profil.</p>
      )}
    </section>
  );
}
