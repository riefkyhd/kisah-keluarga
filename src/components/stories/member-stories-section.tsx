import Link from "next/link";
import type { StoryListItem } from "@/server/queries/stories";

type MemberStoriesSectionProps = {
  personId: string;
  stories: StoryListItem[];
  canManage: boolean;
};

export function MemberStoriesSection({ personId, stories, canManage }: MemberStoriesSectionProps) {
  return (
    <section
      data-testid="member-stories-section"
      className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
    >
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-900">Cerita & Kenangan</h3>
        <p className="text-sm text-slate-700">
          Kumpulan momen penting yang terkait dengan anggota ini.
        </p>
      </header>

      {stories.length === 0 ? (
        <p className="text-sm text-slate-500">
          Belum ada cerita untuk anggota ini.
        </p>
      ) : (
        <ul className="space-y-2">
          {stories.map((story) => (
            <li key={story.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div className="space-y-1">
                <Link href={`/cerita/${story.id}`} className="font-medium text-slate-900">
                  {story.title}
                </Link>
                <p className="text-sm text-slate-600">
                  {story.event_date ? `Tanggal kejadian: ${story.event_date}` : "Tanggal kejadian belum diisi"}
                </p>
              </div>
              {canManage ? (
                <div className="mt-2 text-sm font-semibold text-slate-700">
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
            className="inline-block rounded-lg bg-amber-500 px-4 py-3 text-sm font-semibold text-white"
          >
            Tambah Cerita
          </Link>
        </div>
      ) : null}
    </section>
  );
}
