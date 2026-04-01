import Link from "next/link";
import { MemberAvatar } from "@/components/members/member-avatar";
import { Card } from "@/components/ui/card";
import type { MemberListItem } from "@/server/queries/members";

type MemberCardProps = {
  member: MemberListItem;
};

function buildSubtitle(member: MemberListItem) {
  const parts = [];

  if (member.nickname) {
    parts.push(`Panggilan: ${member.nickname}`);
  }

  if (member.birth_date) {
    parts.push(`Lahir: ${member.birth_date}`);
  }

  if (!member.is_living && member.death_date) {
    parts.push(`Wafat: ${member.death_date}`);
  }

  return parts.join(" • ");
}

export function MemberCard({ member }: MemberCardProps) {
  const subtitle = buildSubtitle(member);

  return (
    <li>
      <Link href={`/keluarga/${member.id}`} className="group block">
        <Card
          clickable
          className="flex min-h-[92px] items-center gap-4 rounded-[1.5rem] border-stone-200 p-4 transition-colors hover:border-amber-200"
        >
          <MemberAvatar fullName={member.full_name} photoUrl={member.profile_photo_url} size="sm" />
          <div className="min-w-0 space-y-1">
            <h3 className="break-words text-base font-semibold leading-snug text-stone-900 transition-colors group-hover:text-amber-700">
              {member.full_name}
            </h3>
            {subtitle ? <p className="break-words text-sm leading-relaxed text-stone-600">{subtitle}</p> : null}
          </div>

          <span className="ml-auto hidden rounded-lg bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-600 sm:inline">
            Profil
          </span>
        </Card>
      </Link>
    </li>
  );
}
