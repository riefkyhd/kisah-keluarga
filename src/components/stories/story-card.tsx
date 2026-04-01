import Link from "next/link";
import type { StoryListItem } from "@/server/queries/stories";

type StoryCardProps = {
  story: StoryListItem;
  showPerson?: boolean;
  canManage?: boolean;
};

function buildStoryPreview(body: string) {
  const normalized = body.trim().replace(/\s+/g, " ");
  if (normalized.length <= 180) {
    return normalized;
  }

  return `${normalized.slice(0, 177)}...`;
}

export function StoryCard({ story, showPerson = true, canManage = false }: StoryCardProps) {
  return (
    <article className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-900">
          <Link href={`/cerita/${story.id}`} className="hover:text-amber-700">
            {story.title}
          </Link>
        </h3>
        <p className="text-sm leading-relaxed text-slate-600">
          {story.event_date ? `Tanggal kejadian: ${story.event_date}` : "Tanggal kejadian belum diisi"}
        </p>
        {showPerson ? (
          <p className="text-sm leading-relaxed text-slate-600">
            Terkait anggota: <Link href={`/keluarga/${story.person_id}`}>{story.person_full_name}</Link>
          </p>
        ) : null}
      </header>

      <p className="text-base leading-relaxed text-slate-700">{buildStoryPreview(story.body)}</p>

      <div className="flex flex-wrap gap-3 text-base font-semibold">
        <Link href={`/cerita/${story.id}`} className="text-amber-700">
          Buka detail cerita
        </Link>
        {canManage ? (
          <Link href={`/cerita/${story.id}/edit`} className="text-slate-700">
            Edit Cerita
          </Link>
        ) : null}
      </div>
    </article>
  );
}
