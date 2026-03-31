import Link from "next/link";
import { MemberAvatar } from "@/components/members/member-avatar";
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
      <Link
        href={`/keluarga/${member.id}`}
        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-amber-300"
      >
        <MemberAvatar fullName={member.full_name} photoUrl={member.profile_photo_url} size="sm" />
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900">{member.full_name}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
        </div>
      </Link>
    </li>
  );
}
