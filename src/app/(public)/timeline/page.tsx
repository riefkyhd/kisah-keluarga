import Link from "next/link";
import { getCurrentUserRole, requireViewer } from "@/lib/permissions/guards";
import { hasMinimumRole } from "@/lib/auth/roles";
import { StoryCard } from "@/components/stories/story-card";
import { listTimelineStories } from "@/server/queries/stories";

export default async function TimelinePage() {
  await requireViewer("/timeline");
  const role = await getCurrentUserRole();
  const canManageStories = hasMinimumRole(role, "editor");
  const stories = await listTimelineStories();

  return (
    <section className="space-y-4">
      <p className="text-sm font-medium uppercase tracking-wide text-amber-700">Timeline Keluarga</p>
      <h2 data-testid="timeline-page-heading" className="text-2xl font-semibold text-slate-900">
        Cerita & Momen Keluarga
      </h2>
      <p className="text-slate-700">
        Timeline ini membantu keluarga menyimpan momen penting secara hangat dan mudah dibaca.
      </p>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/keluarga"
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800"
        >
          Buka Direktori Keluarga
        </Link>
        {canManageStories ? (
          <Link
            href="/cerita-baru"
            className="rounded-lg bg-amber-500 px-4 py-3 text-sm font-semibold text-white"
          >
            Tambah Cerita
          </Link>
        ) : null}
      </div>

      {stories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-slate-700">
          Belum ada cerita keluarga yang aktif. Editor atau admin dapat menambahkan cerita pertama.
        </div>
      ) : (
        <ul className="space-y-3" data-testid="timeline-story-list">
          {stories.map((story) => (
            <li key={story.id}>
              <StoryCard story={story} canManage={canManageStories} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
