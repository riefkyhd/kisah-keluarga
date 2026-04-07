"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MemberAvatar } from "@/components/members/member-avatar";
import { Card } from "@/components/ui/card";
import { formatBirthDate } from "@/lib/people";
import type { DirectoryMemberListItem } from "@/server/queries/members";

type MemberCardProps = {
  member: DirectoryMemberListItem;
  index?: number;
};

export function MemberCard({ member, index = 0 }: MemberCardProps) {
  const birthDateLabel = formatBirthDate(member.birth_date);
  const childCountLabel = member.child_count > 0 ? `${member.child_count} anak` : "Belum ada anak";

  return (
    <motion.li
      data-testid="member-directory-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <Link href={`/keluarga/${member.id}`} className="group block h-full">
        <Card
          clickable
          className="relative flex h-full min-h-[320px] flex-col gap-5 border-[color:var(--kk-border)] bg-[color:var(--kk-surface)] p-6"
        >
          <div className="flex items-start gap-4">
            <MemberAvatar
              fullName={member.full_name}
              photoUrl={member.profile_photo_url}
              size="md"
              coloredFallback
            />
            <div className="min-w-0 flex-1 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="break-words text-lg font-medium leading-tight text-[color:var(--color-bark)] transition-colors group-hover:text-[color:var(--color-clay)]">
                  {member.full_name}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {member.nickname ? (
                  <span className="rounded-[999px] border border-[color:var(--kk-border)] bg-[color:var(--color-warm)] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[color:var(--color-clay)]">
                    &quot;{member.nickname}&quot;
                  </span>
                ) : null}
                <span className="rounded-[999px] border border-[color:var(--kk-border)] bg-[color:var(--color-warm)] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[color:var(--color-clay)]">
                  {member.primary_relationship_label}
                </span>
                {member.generation ? (
                  <span className="rounded-[999px] border border-[color:var(--kk-border)] bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[color:var(--color-bark)] shadow-[var(--kk-shadow-soft)]">
                    Gen {member.generation}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-auto grid gap-3 border-t border-[color:var(--kk-border)] pt-4 text-sm text-[color:var(--kk-muted)] sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-wider text-[color:var(--color-clay)]">Lahir</span>
              <span className="text-[color:var(--color-bark)] text-base">{birthDateLabel ?? "Belum diisi"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-wider text-[color:var(--color-clay)]">Keluarga Inti</span>
              <span className="text-[color:var(--color-bark)] text-base">{childCountLabel}</span>
            </div>
          </div>

          <div className="absolute right-4 top-4 opacity-0 transition-opacity duration-[var(--kk-duration-fast)] group-hover:opacity-100">
            <span className="rounded-[999px] bg-[color:var(--color-clay)] px-3 py-1.5 text-xs font-medium text-white shadow-[var(--kk-shadow-soft)]">
              Lihat Profil
            </span>
          </div>
        </Card>
      </Link>
    </motion.li>
  );
}
