import type { StoryCandidateMember } from "@/server/queries/stories";

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
    <form action={action} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      {storyId ? <input type="hidden" name="story_id" value={storyId} /> : null}

      <label className="block space-y-2 text-base font-semibold text-slate-800">
        Anggota yang terkait
        <select
          required
          name="person_id"
          defaultValue={initialValues?.person_id ?? ""}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none ring-amber-200 focus:border-amber-400 focus:ring-2"
        >
          <option value="">Pilih anggota keluarga</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.full_name}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2 text-base font-semibold text-slate-800">
        Judul cerita
        <input
          required
          name="title"
          defaultValue={initialValues?.title ?? ""}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none ring-amber-200 focus:border-amber-400 focus:ring-2"
          placeholder="Contoh: Pernikahan Kakek dan Nenek"
        />
      </label>

      <label className="block space-y-2 text-base font-semibold text-slate-800">
        Tanggal kejadian (opsional)
        <input
          type="date"
          name="event_date"
          defaultValue={initialValues?.event_date ?? ""}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none ring-amber-200 focus:border-amber-400 focus:ring-2"
        />
      </label>

      <label className="block space-y-2 text-base font-semibold text-slate-800">
        Cerita singkat
        <textarea
          required
          name="body"
          defaultValue={initialValues?.body ?? ""}
          rows={6}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none ring-amber-200 focus:border-amber-400 focus:ring-2"
          placeholder="Tuliskan cerita atau momen penting keluarga secara singkat..."
        />
      </label>

      <button
        type="submit"
        className="w-full rounded-lg bg-amber-500 px-4 py-3 text-base font-semibold text-white"
      >
        {submitLabel}
      </button>
    </form>
  );
}
