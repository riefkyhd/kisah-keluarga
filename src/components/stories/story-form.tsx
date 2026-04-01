import type { StoryCandidateMember } from "@/server/queries/stories";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type StoryFormProps = {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  members: StoryCandidateMember[];
  storyId?: string;
  initialValues?: {
    person_id?: string;
    title?: string;
    body?: string;
    event_date?: string | null;
  };
};

export function StoryForm({ action, submitLabel, members, storyId, initialValues }: StoryFormProps) {
  return (
    <Card className="rounded-[2rem] border-stone-100 p-5 sm:p-6">
      <form action={action} className="space-y-6">
        {storyId ? <input type="hidden" name="story_id" value={storyId} /> : null}

        <div className="space-y-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">Konteks Cerita</p>
          <label className="block space-y-2 text-base font-semibold text-stone-800">
            Anggota yang terkait
            <select
              required
              name="person_id"
              defaultValue={initialValues?.person_id ?? ""}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-base text-stone-900 outline-none ring-amber-200 focus:border-amber-400 focus:ring-2"
            >
              <option value="">Pilih anggota keluarga</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2 text-base font-semibold text-stone-800">
            Judul cerita
            <input
              required
              name="title"
              defaultValue={initialValues?.title ?? ""}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-base text-stone-900 outline-none ring-amber-200 placeholder:text-stone-400 focus:border-amber-400 focus:ring-2"
              placeholder="Contoh: Pernikahan Kakek dan Nenek"
            />
          </label>
        </div>

        <label className="block space-y-2 text-base font-semibold text-stone-800">
          Tanggal kejadian (opsional)
          <input
            type="date"
            name="event_date"
            defaultValue={initialValues?.event_date ?? ""}
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-base text-stone-900 outline-none ring-amber-200 focus:border-amber-400 focus:ring-2"
          />
        </label>

        <div className="space-y-3">
          <label className="block space-y-2 text-base font-semibold text-stone-800">
            Cerita singkat
            <textarea
              required
              name="body"
              defaultValue={initialValues?.body ?? ""}
              rows={8}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-base leading-relaxed text-stone-900 outline-none ring-amber-200 placeholder:text-stone-400 focus:border-amber-400 focus:ring-2"
              placeholder="Tuliskan cerita atau momen penting keluarga secara singkat..."
            />
          </label>

          <p className="text-sm leading-relaxed text-stone-600">
            Gunakan bahasa yang hangat dan sederhana agar cerita mudah dipahami semua anggota keluarga.
          </p>
        </div>

        <Button type="submit" className="w-full">
          {submitLabel}
        </Button>
      </form>
    </Card>
  );
}
