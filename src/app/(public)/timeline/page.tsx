import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
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
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Timeline Keluarga"
        title="Cerita & Momen Keluarga"
        description="Kumpulan cerita penting keluarga yang disusun rapi agar mudah dibaca lintas generasi."
      />

      <h2 data-testid="timeline-page-heading" className="sr-only">
        Cerita & Momen Keluarga
      </h2>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/keluarga"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-stone-200 bg-white px-5 py-3 text-base font-semibold text-stone-700 transition-colors hover:bg-stone-50"
        >
          Buka Direktori Keluarga
        </Link>
        {canManageStories ? (
          <Link
            href="/cerita-baru"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-amber-700 px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-amber-800"
          >
            Tambah Cerita
          </Link>
        ) : null}
      </div>

      {stories.length === 0 ? (
        <EmptyState
          title="Belum ada cerita aktif"
          description="Editor atau admin dapat menambahkan cerita pertama agar momen keluarga mulai terdokumentasi."
        />
      ) : (
        <ul className="space-y-4" data-testid="timeline-story-list">
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
