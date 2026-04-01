import Link from "next/link";
import { Card } from "@/components/ui/card";
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
    <Card className="rounded-[1.75rem] border-stone-100 p-5 sm:p-6">
      <article className="space-y-4">
        <header className="space-y-2">
          <h3 className="text-xl font-semibold text-stone-900">
            <Link href={`/cerita/${story.id}`} className="transition-colors hover:text-amber-700">
              {story.title}
            </Link>
          </h3>
          <p className="text-sm leading-relaxed text-stone-600">
            {story.event_date ? `Tanggal kejadian: ${story.event_date}` : "Tanggal kejadian belum diisi"}
          </p>
          {showPerson ? (
            <p className="text-sm leading-relaxed text-stone-600">
              Terkait anggota:{" "}
              <Link href={`/keluarga/${story.person_id}`} className="font-medium text-stone-700 hover:text-amber-700">
                {story.person_full_name}
              </Link>
            </p>
          ) : null}
        </header>

        <p className="text-base leading-relaxed text-stone-700">{buildStoryPreview(story.body)}</p>

        <div className="flex flex-wrap gap-2 text-sm font-semibold sm:text-base">
          <Link
            href={`/cerita/${story.id}`}
            className="inline-flex min-h-10 items-center rounded-xl bg-amber-50 px-4 py-2 text-amber-800 transition-colors hover:bg-amber-100"
          >
            Buka detail cerita
          </Link>
          {canManage ? (
            <Link
              href={`/cerita/${story.id}/edit`}
              className="inline-flex min-h-10 items-center rounded-xl border border-stone-200 bg-white px-4 py-2 text-stone-700 transition-colors hover:bg-stone-50"
            >
              Edit Cerita
            </Link>
          ) : null}
        </div>
      </article>
    </Card>
  );
}
