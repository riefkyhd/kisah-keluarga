import Link from "next/link";
import { notFound } from "next/navigation";
import { StoryForm } from "@/components/stories/story-form";
import { requireEditor } from "@/lib/permissions/guards";
import { archiveStoryAction, updateStoryAction } from "@/server/actions/stories";
import { getStoryById, listStoryMemberCandidates } from "@/server/queries/stories";

type EditStoryPageProps = {
  params: Promise<{ storyId: string }>;
  searchParams: Promise<{ error?: string; status?: string }>;
};

const errorMessages: Record<string, string> = {
  invalid_form: "Data cerita belum valid. Mohon periksa kembali.",
  invalid_story: "Cerita tidak ditemukan atau tidak valid.",
  invalid_member: "Anggota terkait tidak valid.",
  archived_member: "Anggota yang diarsipkan tidak dapat ditautkan ke cerita.",
  save_failed: "Perubahan cerita belum tersimpan. Coba lagi.",
  archive_failed: "Cerita belum berhasil diarsipkan. Coba lagi."
};

const statusMessages: Record<string, string> = {
  archived: "Cerita berhasil diarsipkan."
};

export default async function EditStoryPage({ params, searchParams }: EditStoryPageProps) {
  const { storyId } = await params;
  await requireEditor(`/cerita/${storyId}/edit`);

  const story = await getStoryById(storyId, true, true);
  if (!story) {
    notFound();
  }

  const candidates = await listStoryMemberCandidates();
  const query = await searchParams;
  const errorMessage = query.error ? errorMessages[query.error] : "";
  const statusMessage = query.status ? statusMessages[query.status] : "";

  return (
    <section className="space-y-4">
      <Link href={`/cerita/${story.id}`} className="inline-block text-sm font-medium text-amber-700">
        ← Kembali ke detail cerita
      </Link>

      <h2 className="text-2xl font-semibold text-slate-900">Edit Cerita</h2>
      <p className="text-slate-700">Perbarui isi cerita atau arsipkan cerita dengan aman.</p>

      {errorMessage ? (
        <div className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
          {errorMessage}
        </div>
      ) : null}

      {statusMessage ? (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
          {statusMessage}
        </div>
      ) : null}

      <StoryForm
        action={updateStoryAction}
        submitLabel="Simpan Perubahan Cerita"
        members={candidates}
        storyId={story.id}
        initialValues={{
          person_id: story.person_id,
          title: story.title,
          body: story.body,
          event_date: story.event_date
        }}
      />

      {!story.is_archived ? (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-base font-semibold text-slate-900">Arsip Cerita</h3>
          <p className="text-sm text-slate-700">
            Penghapusan permanen tidak disediakan di fase ini. Gunakan arsip agar cerita tetap aman.
          </p>
          <form action={archiveStoryAction}>
            <input type="hidden" name="story_id" value={story.id} />
            <button
              type="submit"
              className="w-full rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white"
            >
              Arsipkan Cerita
            </button>
          </form>
        </section>
      ) : (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Cerita ini sedang diarsipkan dan tidak tampil di timeline utama.
        </div>
      )}
    </section>
  );
}
