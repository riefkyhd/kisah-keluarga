import Link from "next/link";
import { notFound } from "next/navigation";
import { StoryForm } from "@/components/stories/story-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBanner } from "@/components/ui/status-banner";
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
        className="inline-flex rounded-xl px-3 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50"
      >
        ← Kembali ke detail cerita
      </Link>

      <SectionHeader
        eyebrow="Kelola Cerita"
        title="Edit Cerita"
        description="Perbarui isi cerita agar tetap akurat dan mudah dipahami keluarga."
      />

      {errorMessage ? (
        <StatusBanner variant="error" message={errorMessage} />
      ) : null}

      {statusMessage ? (
        <StatusBanner variant="success" message={statusMessage} />
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
        <Card className="space-y-4 rounded-[1.75rem] border-stone-100 p-5">
          <h3 className="text-base font-semibold text-stone-900">Arsip Cerita</h3>
          <p className="text-sm leading-relaxed text-stone-700">
            Penghapusan permanen tidak disediakan di fase ini. Gunakan arsip agar cerita tetap aman.
          </p>
          <form action={archiveStoryAction}>
            <input type="hidden" name="story_id" value={story.id} />
            <Button type="submit" variant="secondary" className="w-full bg-amber-50 text-amber-900 hover:bg-amber-100">
              Arsipkan Cerita
            </Button>
          </form>
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
