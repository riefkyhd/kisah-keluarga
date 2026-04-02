import Link from "next/link";
import { notFound } from "next/navigation";
import { StoryForm } from "@/components/stories/story-form";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBanner } from "@/components/ui/status-banner";
import { StatusToast } from "@/components/ui/status-toast";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
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
    <section className="space-y-6">
      <Link
        href={`/cerita/${story.id}`}
        className="inline-flex min-h-10 items-center rounded-xl px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
      >
        ← Kembali ke detail cerita
      </Link>

      <SectionHeader
        eyebrow="Kelola Cerita"
        title="Edit Cerita"
        description="Perbarui isi cerita agar tetap akurat dan mudah dipahami keluarga."
      />

      {errorMessage ? (
        <>
          <StatusToast variant="error" message={errorMessage} />
          <StatusBanner variant="error" message={errorMessage} />
        </>
      ) : null}

      {statusMessage ? (
        <>
          <StatusToast variant="success" message={statusMessage} />
          <StatusBanner variant="success" message={statusMessage} />
        </>
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
        <Card className="space-y-4 rounded-[1.75rem] border-stone-100 p-5 sm:p-6">
          <h3 className="text-base font-semibold text-stone-900">Arsip Cerita</h3>
          <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-sm leading-relaxed text-stone-700">
              Penghapusan permanen tidak disediakan di fase ini. Gunakan arsip agar cerita tetap aman namun tidak lagi
              tampil di timeline utama.
            </p>
            <form action={archiveStoryAction}>
              <input type="hidden" name="story_id" value={story.id} />
              <FormSubmitButton
                type="submit"
                variant="secondary"
                className="w-full bg-amber-100 text-amber-900 hover:bg-amber-200"
                pendingLabel="Mengarsipkan..."
              >
                Arsipkan Cerita
              </FormSubmitButton>
            </form>
          </div>
        </Card>
      ) : (
        <StatusBanner
          variant="warning"
          message="Cerita ini sedang diarsipkan dan tidak tampil di timeline utama."
        />
      )}
    </section>
  );
}
