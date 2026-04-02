import Link from "next/link";
import { MemberAvatar } from "@/components/members/member-avatar";
import { Card } from "@/components/ui/card";
import { formatBirthDate } from "@/lib/people";
import type { DirectoryMemberListItem } from "@/server/queries/members";

type MemberCardProps = {
  member: DirectoryMemberListItem;
};

export function MemberCard({ member }: MemberCardProps) {
  const birthDateLabel = formatBirthDate(member.birth_date);
  const childCountLabel = member.child_count > 0 ? `${member.child_count} anak` : "Belum ada anak";

  return (
    <li data-testid="member-directory-card">
      <Link href={`/keluarga/${member.id}`} className="group block">
        <Card
          clickable
          className="space-y-4 border-[color:rgba(212,184,150,0.4)] p-4 hover:border-[color:var(--color-sand)]"
        >
          <div className="flex items-start gap-4">
            <MemberAvatar
              fullName={member.full_name}
              photoUrl={member.profile_photo_url}
              size="sm"
              coloredFallback
            />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="break-words text-base leading-snug text-[color:var(--color-bark)] group-hover:text-[color:var(--color-clay)]">
                  {member.full_name}
                </h3>
                {member.nickname ? (
                  <span className="rounded-full bg-[color:var(--color-warm)] px-3 py-1 text-xs font-medium text-[color:var(--color-clay)]">
                    Panggilan: {member.nickname}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {member.generation ? (
                  <span className="rounded-full bg-[color:var(--color-warm)] px-3 py-1 text-xs font-medium text-[color:var(--color-bark)]">
                    Gen {member.generation}
                  </span>
                ) : null}
                <span className="rounded-full bg-[color:#f7f3ed] px-3 py-1 text-xs font-medium text-[color:var(--color-clay)]">
                  {member.primary_relationship_label}
                </span>
              </div>
            </div>

            <span className="ml-auto hidden rounded-[var(--kk-radius-sm)] bg-[color:var(--color-warm)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-clay)] sm:inline">
              Profil
            </span>
          </div>

          <div className="grid gap-2 text-sm font-normal text-[color:var(--kk-muted)] sm:grid-cols-2">
            <p>
              <span className="font-medium text-[color:var(--color-bark)]">Lahir:</span>{" "}
              {birthDateLabel ?? "Belum diisi"}
            </p>
            <p>
              <span className="font-medium text-[color:var(--color-bark)]">Keluarga inti:</span> {childCountLabel}
            </p>
          </div>
        </Card>
      </Link>
    </li>
  );
}
