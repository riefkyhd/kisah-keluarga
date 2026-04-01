import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { StoryListItem } from "@/server/queries/stories";

type MemberStoriesSectionProps = {
  personId: string;
  stories: StoryListItem[];
  canManage: boolean;
};

export function MemberStoriesSection({ personId, stories, canManage }: MemberStoriesSectionProps) {
  return (
    <Card
      data-testid="member-stories-section"
      className="space-y-4 rounded-[2rem] border-stone-100 p-5 sm:p-6"
    >
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-stone-900">Cerita & Kenangan</h3>
        <p className="text-sm leading-relaxed text-stone-600">
          Kumpulan momen penting yang terkait dengan anggota ini.
        </p>
      </header>

      {stories.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-sm leading-relaxed text-stone-600">
          Belum ada cerita untuk anggota ini.
        </p>
      ) : (
        <ul className="space-y-3">
          {stories.map((story) => (
            <li key={story.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <div className="space-y-1">
                <Link href={`/cerita/${story.id}`} className="font-medium text-stone-900 hover:text-amber-800">
                  {story.title}
                </Link>
                <p className="text-sm leading-relaxed text-stone-600">
                  {story.event_date ? `Tanggal kejadian: ${story.event_date}` : "Tanggal kejadian belum diisi"}
                </p>
              </div>
              {canManage ? (
                <div className="mt-3 text-sm font-semibold text-stone-700">
                  <Link href={`/cerita/${story.id}/edit`}>Edit Cerita</Link>
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
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-amber-700 px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-amber-800"
          >
            Tambah Cerita
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
