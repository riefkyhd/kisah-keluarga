import Link from "next/link";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
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
          action={
            canManageStories ? (
              <Link
                href="/cerita-baru"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-800"
              >
                Tambah Cerita Pertama
              </Link>
            ) : null
          }
        />
      ) : (
        <ul
          className="relative space-y-7 before:absolute before:inset-y-3 before:left-5 before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-200 before:to-transparent md:before:left-1/2 md:before:-ml-px"
          data-testid="timeline-story-list"
        >
          {stories.map((story, index) => (
            <li key={story.id} className="relative flex md:justify-normal md:odd:flex-row-reverse">
              <div className="absolute left-5 top-8 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-4 border-[#F9F7F4] bg-amber-700 md:left-1/2" />
              <div className="ml-10 w-[calc(100%-2.5rem)] md:ml-0 md:w-[calc(50%-2.5rem)]">
                <StoryCard story={story} canManage={canManageStories} variant="timeline" showPerson={index % 2 === 0} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {canManageStories ? (
        <FloatingActionButton href="/cerita-baru" label="Tambah Cerita" icon={FileText} className="md:hidden" />
      ) : null}
    </section>
  );
}
