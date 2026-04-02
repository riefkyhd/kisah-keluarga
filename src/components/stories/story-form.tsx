import type { StoryCandidateMember } from "@/server/queries/stories";
import { Card } from "@/components/ui/card";
import { FormSubmitButton } from "@/components/ui/form-submit-button";

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
    <Card className="border-[color:rgba(212,184,150,0.4)]">
      <form action={action} className="space-y-6">
        {storyId ? <input type="hidden" name="story_id" value={storyId} /> : null}

        <div className="space-y-4 rounded-[var(--kk-radius-md)] border border-[color:var(--color-sand)] bg-[color:var(--color-warm)] p-4 sm:p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[color:var(--color-clay)]">Konteks Cerita</p>
          <label className="block space-y-2 text-base font-medium text-[color:var(--color-bark)]">
            Anggota yang terkait
            <select
              required
              name="person_id"
              defaultValue={initialValues?.person_id ?? ""}
              className="w-full rounded-[var(--kk-radius-sm)] border border-[color:var(--color-sand)] bg-[color:var(--kk-surface)] px-4 py-3 text-base text-[color:var(--color-bark)] outline-none focus:ring-2 focus:ring-[color:var(--kk-focus)]"
            >
              <option value="">Pilih anggota keluarga</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2 text-base font-medium text-[color:var(--color-bark)]">
            Judul cerita
            <input
              required
              name="title"
              defaultValue={initialValues?.title ?? ""}
              className="w-full rounded-[var(--kk-radius-sm)] border border-[color:var(--color-sand)] bg-[color:var(--kk-surface)] px-4 py-3 text-base text-[color:var(--color-bark)] outline-none placeholder:text-[color:var(--kk-muted)] focus:ring-2 focus:ring-[color:var(--kk-focus)]"
              placeholder="Contoh: Pernikahan Kakek dan Nenek"
            />
          </label>
        </div>

        <label className="block space-y-2 text-base font-medium text-[color:var(--color-bark)]">
          Tanggal kejadian (opsional)
          <input
            type="date"
            name="event_date"
            defaultValue={initialValues?.event_date ?? ""}
            className="w-full rounded-[var(--kk-radius-sm)] border border-[color:var(--color-sand)] bg-[color:var(--color-warm)] px-4 py-3 text-base text-[color:var(--color-bark)] outline-none focus:ring-2 focus:ring-[color:var(--kk-focus)]"
          />
        </label>

        <div className="space-y-3">
          <label className="block space-y-2 text-base font-medium text-[color:var(--color-bark)]">
            Cerita singkat
            <textarea
              required
              name="body"
              defaultValue={initialValues?.body ?? ""}
              rows={8}
              className="w-full rounded-[var(--kk-radius-sm)] border border-[color:var(--color-sand)] bg-[color:var(--color-warm)] px-4 py-3 text-base leading-relaxed text-[color:var(--color-bark)] outline-none placeholder:text-[color:var(--kk-muted)] focus:ring-2 focus:ring-[color:var(--kk-focus)]"
              placeholder="Tuliskan cerita atau momen penting keluarga secara singkat..."
            />
          </label>

          <p className="text-sm font-normal leading-relaxed text-[color:var(--kk-muted)]">
            Gunakan bahasa yang hangat dan sederhana agar cerita mudah dipahami semua anggota keluarga.
          </p>
        </div>

        <FormSubmitButton type="submit" className="w-full" pendingLabel="Menyimpan...">
          {submitLabel}
        </FormSubmitButton>
      </form>
    </Card>
  );
}
