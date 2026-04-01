import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBanner } from "@/components/ui/status-banner";
import { getCurrentUserRole, requireViewer } from "@/lib/permissions/guards";
import { hasMinimumRole } from "@/lib/auth/roles";
import { getStoryById } from "@/server/queries/stories";

type StoryDetailPageProps = {
  params: Promise<{ storyId: string }>;
  searchParams: Promise<{ status?: string }>;
};

const statusMessages: Record<string, string> = {
  created: "Cerita berhasil disimpan.",
  updated: "Cerita berhasil diperbarui."
};

export default async function StoryDetailPage({ params, searchParams }: StoryDetailPageProps) {
  const { storyId } = await params;
  await requireViewer(`/cerita/${storyId}`);

  const role = await getCurrentUserRole();
  const canManageStories = hasMinimumRole(role, "editor");

  const story = await getStoryById(storyId, canManageStories, canManageStories);
  if (!story) {
    notFound();
  }

  const query = await searchParams;
  const statusMessage = query.status ? statusMessages[query.status] : "";
  const eventYear = story.event_date ? String(new Date(story.event_date).getFullYear()) : "Momen";

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          className="inline-flex min-h-10 items-center rounded-xl px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
          href="/timeline"
        >
          ← Kembali ke timeline
        </Link>
        {canManageStories ? (
          <Link
            href={`/cerita/${story.id}/edit`}
            className="inline-flex min-h-10 items-center rounded-xl bg-stone-200 px-4 py-2 text-sm font-medium text-stone-800 transition-colors hover:bg-stone-300"
          >
            Edit Cerita
          </Link>
        ) : null}
      </div>

      {statusMessage ? (
        <StatusBanner variant="success" message={statusMessage} />
      ) : null}

      <Card className="space-y-5 rounded-[2rem] border-stone-100 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-lg bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800">
            {eventYear}
          </span>
          <p className="text-sm font-medium text-stone-500">
            Terkait anggota:{" "}
            <Link href={`/keluarga/${story.person_id}`} className="font-semibold text-stone-700 hover:text-amber-700">
              {story.person_full_name}
            </Link>
          </p>
        </div>
        <SectionHeader
          title={story.title}
          description={story.event_date ? `Tanggal kejadian: ${story.event_date}` : "Tanggal kejadian belum diisi"}
          eyebrow="Cerita Keluarga"
        />

        {story.is_archived ? (
          <StatusBanner variant="warning" message="Cerita ini sedang diarsipkan." />
        ) : null}
      </Card>

      <Card className="rounded-[2rem] border-stone-100 p-6 sm:p-8">
        <article className="prose prose-stone max-w-none text-base leading-relaxed sm:prose-lg">
          <p className="whitespace-pre-wrap text-stone-800">{story.body}</p>
        </article>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/keluarga/${story.person_id}`}
          className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-stone-200 bg-white px-5 py-3 text-base font-semibold text-stone-700 transition-colors hover:bg-stone-50"
        >
          Buka profil anggota terkait
        </Link>
      </div>
    </section>
  );
}
