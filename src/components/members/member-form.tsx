import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
  return (
    <Card className="rounded-[2rem] border-stone-100 p-5 sm:p-6">
      <form action={action} className="space-y-5">
        {personId ? <input type="hidden" name="person_id" value={personId} /> : null}

        <label className="block space-y-2 text-base font-semibold text-stone-800">
          Nama lengkap
          <input
            required
            name="full_name"
            defaultValue={initialValues?.full_name ?? ""}
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-base text-stone-900 outline-none ring-amber-200 placeholder:text-stone-400 focus:border-amber-400 focus:ring-2"
            placeholder="Contoh: Ahmad Wijaya"
          />
        </label>

        <label className="block space-y-2 text-base font-semibold text-stone-800">
          Nama panggilan (opsional)
          <input
            name="nickname"
            defaultValue={initialValues?.nickname ?? ""}
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-base text-stone-900 outline-none ring-amber-200 placeholder:text-stone-400 focus:border-amber-400 focus:ring-2"
            placeholder="Contoh: Pak Ahmad"
          />
        </label>

        <label className="block space-y-2 text-base font-semibold text-stone-800">
          Jenis kelamin (opsional)
          <select
            name="gender"
            defaultValue={initialValues?.gender ?? ""}
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-base text-stone-900 outline-none ring-amber-200 focus:border-amber-400 focus:ring-2"
          >
            <option value="">Belum diisi</option>
            <option value="male">Laki-laki</option>
            <option value="female">Perempuan</option>
            <option value="other">Lainnya</option>
          </select>
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-base font-semibold text-stone-800">
            Tanggal lahir (opsional)
            <input
              type="date"
              name="birth_date"
              defaultValue={initialValues?.birth_date ?? ""}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-base text-stone-900 outline-none ring-amber-200 focus:border-amber-400 focus:ring-2"
            />
          </label>

          <label className="block space-y-2 text-base font-semibold text-stone-800">
            Tanggal wafat (opsional)
            <input
              type="date"
              name="death_date"
              defaultValue={initialValues?.death_date ?? ""}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-base text-stone-900 outline-none ring-amber-200 focus:border-amber-400 focus:ring-2"
            />
          </label>
        </div>

        <label className="block space-y-2 text-base font-semibold text-stone-800">
          Status kehidupan
          <select
            name="is_living"
            defaultValue={initialValues?.is_living === false ? "false" : "true"}
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-base text-stone-900 outline-none ring-amber-200 focus:border-amber-400 focus:ring-2"
          >
            <option value="true">Masih hidup</option>
            <option value="false">Sudah wafat</option>
          </select>
        </label>

        <label className="block space-y-2 text-base font-semibold text-stone-800">
          Catatan singkat (opsional)
          <textarea
            name="bio"
            defaultValue={initialValues?.bio ?? ""}
            rows={4}
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-base text-stone-900 outline-none ring-amber-200 placeholder:text-stone-400 focus:border-amber-400 focus:ring-2"
            placeholder="Catatan keluarga singkat..."
          />
        </label>

        <p className="text-sm leading-relaxed text-stone-600">
          Isi data dasar terlebih dahulu. Detail lainnya bisa diperbarui kapan saja dari profil anggota.
        </p>

        <Button type="submit" className="w-full">
          {submitLabel}
        </Button>
      </form>
    </Card>
  );
}
