import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
    <Card data-testid="member-photo-manager" className="space-y-4 rounded-[2rem] border-stone-100 p-5 sm:p-6">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-stone-900">Foto Profil</h3>
        <p className="text-sm leading-relaxed text-stone-600">
          Foto membantu keluarga mengenali anggota dengan lebih mudah.
        </p>
      </header>

      {canManage ? (
        <div className="space-y-3">
          <form action={uploadAction} className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4">
            <input type="hidden" name="person_id" value={personId} />
            <label className="block space-y-2 text-base font-semibold text-stone-800">
              Pilih foto
              <span className="block rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 px-4 py-4">
                <input
                  data-testid="member-photo-upload-input"
                  required
                  type="file"
                  name="photo"
                  accept="image/png,image/jpeg,image/webp"
                  className="block w-full text-sm text-stone-900 file:mr-3 file:rounded-xl file:border-0 file:bg-amber-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-amber-800 hover:file:bg-amber-200"
                />
              </span>
            </label>
            <Button type="submit" className="w-full">
              {hasPhoto ? "Ganti Foto" : "Unggah Foto"}
            </Button>
          </form>

          {hasPhoto ? (
            <form action={removeAction}>
              <input type="hidden" name="person_id" value={personId} />
              <Button type="submit" variant="danger" className="w-full">
                Hapus Foto
              </Button>
            </form>
          ) : null}
        </div>
      ) : (
        <p className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-relaxed text-stone-600">
          Hanya editor/admin yang dapat mengubah foto profil.
        </p>
      )}
    </Card>
  );
}
