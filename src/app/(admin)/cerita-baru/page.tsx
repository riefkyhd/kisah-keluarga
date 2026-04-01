import Link from "next/link";
import { StoryForm } from "@/components/stories/story-form";
import { requireEditor } from "@/lib/permissions/guards";
import { createStoryAction } from "@/server/actions/stories";
import { listStoryMemberCandidates } from "@/server/queries/stories";

type NewStoryPageProps = {
  searchParams: Promise<{ error?: string; personId?: string }>;
};

const errorMessages: Record<string, string> = {
  invalid_form: "Data cerita belum valid. Mohon periksa kembali.",
  invalid_member: "Anggota terkait tidak valid.",
  archived_member: "Anggota yang diarsipkan tidak dapat ditautkan ke cerita baru.",
  save_failed: "Cerita belum tersimpan. Coba lagi sebentar."
};

export default async function NewStoryPage({ searchParams }: NewStoryPageProps) {
  await requireEditor("/cerita-baru");
  const query = await searchParams;
  const candidates = await listStoryMemberCandidates();
  const errorMessage = query.error ? errorMessages[query.error] : "";
  const preselectedPersonId =
    query.personId && candidates.some((member) => member.id === query.personId) ? query.personId : "";

  return (
    <section className="space-y-4">
      <Link href="/timeline" className="inline-block text-sm font-medium text-amber-700">
        ← Kembali ke timeline
      </Link>

      <h2 className="text-2xl font-semibold text-slate-900">Tambah Cerita Keluarga</h2>
      <p className="text-slate-700">
        Tulis momen penting keluarga dengan ringkas agar mudah dipahami semua generasi.
      </p>

      {errorMessage ? (
        <div className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
          {errorMessage}
        </div>
      ) : null}

      {candidates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-slate-700">
          Belum ada anggota aktif untuk ditautkan ke cerita.
        </div>
      ) : (
        <StoryForm
          action={createStoryAction}
          submitLabel="Simpan Cerita"
          members={candidates}
          initialValues={{ person_id: preselectedPersonId }}
        />
      )}
    </section>
  );
}
