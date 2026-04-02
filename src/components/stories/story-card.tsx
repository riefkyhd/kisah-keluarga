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
    "inline-flex min-h-10 items-center rounded-[var(--kk-radius-sm)] px-4 py-2 text-sm font-medium sm:text-base";

  return (
    <Card className="border-[color:rgba(212,184,150,0.4)]">
      <article className="space-y-4">
        <header className="space-y-2">
          {variant === "timeline" ? (
            <span className="inline-flex rounded-[var(--kk-radius-sm)] bg-[color:var(--color-warm)] px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-[color:var(--color-clay)]">
              {eventYear}
            </span>
          ) : null}
          <h3 className="text-xl text-[color:var(--color-bark)]">
            <Link
              href={`/cerita/${story.id}`}
              className="hover:text-[color:var(--color-clay)]"
            >
              {story.title}
            </Link>
          </h3>
          <p className="text-sm font-normal leading-relaxed text-[color:var(--kk-muted)]">
            {eventDateLabel ? `Tanggal kejadian: ${eventDateLabel}` : "Tanggal kejadian belum diisi"}
          </p>
          {showPerson ? (
            <p className="text-sm font-normal leading-relaxed text-[color:var(--kk-muted)]">
              Terkait anggota:{" "}
              <Link href={`/keluarga/${story.person_id}`} className="font-medium text-[color:var(--color-clay)] hover:text-[color:var(--color-bark)]">
                {story.person_full_name}
              </Link>
            </p>
          ) : null}
        </header>

        <p className="text-base font-normal leading-relaxed text-[color:var(--color-bark)]">{buildStoryPreview(story.body)}</p>

        <div className="flex flex-wrap gap-2 text-sm font-medium sm:text-base">
          <Link href={`/cerita/${story.id}`} className={`${actionClass} bg-[color:var(--color-warm)] text-[color:var(--color-clay)] hover:bg-[color:#e7dfd3]`}>
            Buka detail cerita
          </Link>
          {canManage ? (
            <Link href={`/cerita/${story.id}/edit`} className={`${actionClass} border border-[color:var(--color-sand)] bg-[color:var(--kk-surface)] text-[color:var(--color-clay)] hover:bg-[color:var(--color-warm)]`}>
              Edit Cerita
            </Link>
          ) : null}
        </div>
      </article>
    </Card>
  );
}
