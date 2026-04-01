import Link from "next/link";
import { notFound } from "next/navigation";
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

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap gap-2 text-sm font-medium text-amber-700">
        <Link className="rounded-lg px-2 py-2" href="/timeline">
          ← Kembali ke timeline
        </Link>
        <Link className="rounded-lg px-2 py-2" href={`/keluarga/${story.person_id}`}>
          Buka profil anggota terkait
        </Link>
      </div>

      {statusMessage ? (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
          {statusMessage}
        </div>
      ) : null}

      <header className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="text-2xl font-semibold text-slate-900">{story.title}</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          {story.event_date ? `Tanggal kejadian: ${story.event_date}` : "Tanggal kejadian belum diisi"}
        </p>
        <p className="text-sm leading-relaxed text-slate-600">
          Terkait anggota: <Link href={`/keluarga/${story.person_id}`}>{story.person_full_name}</Link>
        </p>
        {story.is_archived ? (
          <p className="rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-900">
            Cerita ini sedang diarsipkan.
          </p>
        ) : null}
      </header>

      <article className="rounded-xl border border-slate-200 bg-white p-4 text-base leading-relaxed text-slate-800 sm:p-5">
        <p className="whitespace-pre-wrap">{story.body}</p>
      </article>

      {canManageStories ? (
        <div>
          <Link
            href={`/cerita/${story.id}/edit`}
            className="inline-block rounded-lg border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-800"
          >
            Edit Cerita
          </Link>
        </div>
      ) : null}
    </section>
  );
}
