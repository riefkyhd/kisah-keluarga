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
          className="inline-flex min-h-12 items-center justify-center rounded-[var(--kk-radius-md)] border border-[color:var(--kk-border)] bg-white px-5 py-3 text-base font-medium text-[color:var(--color-bark)] transition-colors hover:bg-[color:var(--color-warm)]"
        >
          Buka Direktori Keluarga
        </Link>
        {canManageStories ? (
          <Link
            href="/cerita-baru"
            className="inline-flex min-h-12 items-center justify-center rounded-[var(--kk-radius-md)] border border-transparent bg-[color:var(--color-clay)] px-5 py-3 text-base font-medium text-white shadow-[var(--kk-shadow-soft)] transition-colors hover:bg-[color:var(--color-bark)]"
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
          className="relative space-y-8 before:absolute before:inset-y-3 before:left-5 before:w-px before:bg-[linear-gradient(180deg,transparent,rgba(212,184,150,0.8),transparent)] md:before:left-1/2 md:before:-ml-px"
          data-testid="timeline-story-list"
        >
          {stories.map((story, index) => (
            <li key={story.id} className="relative flex md:justify-normal md:odd:flex-row-reverse">
              <div className="absolute left-5 top-8 z-10 h-3 w-3 -translate-x-1/2 rounded-[999px] border-[3px] border-[color:var(--color-cream)] bg-[color:var(--color-clay)] md:left-1/2" />
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
