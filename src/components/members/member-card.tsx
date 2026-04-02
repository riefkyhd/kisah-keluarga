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
          className="space-y-4 rounded-[1.5rem] border-stone-200 p-4 transition-colors hover:border-amber-200"
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
                <h3 className="break-words text-base font-semibold leading-snug text-stone-900 transition-colors group-hover:text-amber-700">
                  {member.full_name}
                </h3>
                {member.nickname ? (
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                    Panggilan: {member.nickname}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {member.generation ? (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                    Gen {member.generation}
                  </span>
                ) : null}
                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
                  {member.primary_relationship_label}
                </span>
              </div>
            </div>

            <span className="ml-auto hidden rounded-lg bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-600 sm:inline">
              Profil
            </span>
          </div>

          <div className="grid gap-2 text-sm text-stone-600 sm:grid-cols-2">
            <p>
              <span className="font-medium text-stone-700">Lahir:</span>{" "}
              {birthDateLabel ?? "Belum diisi"}
            </p>
            <p>
              <span className="font-medium text-stone-700">Keluarga inti:</span> {childCountLabel}
            </p>
          </div>
        </Card>
      </Link>
    </li>
  );
}
