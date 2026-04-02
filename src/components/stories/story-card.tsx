import Link from "next/link";
import { Card } from "@/components/ui/card";
import { formatTanggal } from "@/lib/format-tanggal";
import type { StoryListItem } from "@/server/queries/stories";

type StoryCardProps = {
  story: StoryListItem;
  showPerson?: boolean;
  canManage?: boolean;
  variant?: "default" | "timeline";
};

function buildStoryPreview(body: string) {
  const normalized = body.trim().replace(/\s+/g, " ");
  if (normalized.length <= 180) {
    return normalized;
  }

  return `${normalized.slice(0, 177)}...`;
}

export function StoryCard({
  story,
  showPerson = true,
  canManage = false,
  variant = "default"
}: StoryCardProps) {
  const eventYear = story.event_date ? String(new Date(story.event_date).getFullYear()) : "Momen";
  const eventDateLabel = formatTanggal(story.event_date);
  const actionClass =
    "inline-flex min-h-10 items-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors sm:text-base";

  return (
    <Card className="rounded-[1.75rem] border-stone-100 p-5 sm:p-6">
      <article className="space-y-4">
        <header className="space-y-2">
          {variant === "timeline" ? (
            <span className="inline-flex rounded-lg bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800">
              {eventYear}
            </span>
          ) : null}
          <h3 className="text-xl font-semibold text-stone-900">
            <Link
              href={`/cerita/${story.id}`}
              className="transition-colors hover:text-amber-700"
            >
              {story.title}
            </Link>
          </h3>
          <p className="text-sm leading-relaxed text-stone-600">
            {eventDateLabel ? `Tanggal kejadian: ${eventDateLabel}` : "Tanggal kejadian belum diisi"}
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
          <Link href={`/cerita/${story.id}`} className={`${actionClass} bg-amber-50 text-amber-800 hover:bg-amber-100`}>
            Buka detail cerita
          </Link>
          {canManage ? (
            <Link href={`/cerita/${story.id}/edit`} className={`${actionClass} border border-stone-200 bg-white text-stone-700 hover:bg-stone-50`}>
              Edit Cerita
            </Link>
          ) : null}
        </div>
      </article>
    </Card>
  );
}
