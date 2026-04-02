import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatTanggal } from "@/lib/format-tanggal";
import type { StoryListItem } from "@/server/queries/stories";

type MemberStoriesSectionProps = {
  personId: string;
  stories: StoryListItem[];
  canManage: boolean;
};

export function MemberStoriesSection({ personId, stories, canManage }: MemberStoriesSectionProps) {
  return (
    <Card data-testid="member-stories-section" className="space-y-4 border-[color:rgba(212,184,150,0.4)]">
      <header className="space-y-1">
        <h3 className="text-lg text-[color:var(--color-bark)]">Cerita & Kenangan</h3>
        <p className="text-sm font-normal leading-relaxed text-[color:var(--kk-muted)]">
          Kumpulan momen penting yang terkait dengan anggota ini.
        </p>
      </header>

      {stories.length === 0 ? (
        <EmptyState
          title="Belum ada cerita"
          description="Belum ada cerita untuk anggota ini."
          className="rounded-[var(--kk-radius-md)] border-[color:var(--color-sand)] bg-[color:var(--color-warm)] py-5"
        />
      ) : (
        <ul className="overflow-hidden rounded-[var(--kk-radius-md)] border border-[color:rgba(212,184,150,0.4)] bg-[color:var(--kk-surface)]">
          {stories.map((story) => (
            <li key={story.id} className="border-b border-[color:rgba(212,184,150,0.4)] p-4 last:border-b-0">
              <div className="space-y-1.5">
                <Link href={`/cerita/${story.id}`} className="font-medium text-[color:var(--color-bark)] hover:text-[color:var(--color-clay)]">
                  {story.title}
                </Link>
                <p className="text-sm font-normal leading-relaxed text-[color:var(--kk-muted)]">
                  {story.event_date
                    ? `Tanggal kejadian: ${formatTanggal(story.event_date)}`
                    : "Tanggal kejadian belum diisi"}
                </p>
              </div>
              {canManage ? (
                <div className="mt-3 text-sm font-medium text-[color:var(--color-clay)]">
                  <Link href={`/cerita/${story.id}/edit`} className="hover:text-[color:var(--color-bark)]">
                    Edit Cerita
                  </Link>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {canManage ? (
        <div>
          <Link
            href={`/cerita-baru?personId=${personId}`}
            className="inline-flex min-h-12 items-center justify-center rounded-[var(--kk-radius-md)] bg-[color:var(--color-clay)] px-5 py-3 text-base font-medium text-[color:var(--color-cream)] shadow-[var(--kk-shadow-soft)] hover:bg-[color:var(--color-bark)]"
          >
            Tambah Cerita
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
