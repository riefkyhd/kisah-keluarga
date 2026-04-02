import Link from "next/link";
import type { RelationshipListItem, TreeFocusPerson } from "@/server/queries/relationships";

type FamilyTreeFocusProps = {
  focusPerson: TreeFocusPerson;
  parents: RelationshipListItem[];
  spouse: RelationshipListItem[];
  childMembers: RelationshipListItem[];
};

type TreePersonNodeProps = {
  personId: string;
  fullName: string;
  roleLabel?: string;
  tone?: "default" | "focus";
  testId?: string;
};

function TreePersonNode({ personId, fullName, roleLabel, tone = "default", testId }: TreePersonNodeProps) {
  const toneClasses =
    tone === "focus"
      ? "border-[color:var(--color-sand)] bg-[color:var(--color-warm)] text-[color:var(--color-bark)]"
      : "border-[color:rgba(212,184,150,0.4)] bg-[color:var(--kk-surface)] text-[color:var(--color-bark)]";

  return (
    <Link
      href={`/keluarga/${personId}`}
      data-testid={testId}
      className={`kk-interactive block min-h-[84px] min-w-[164px] rounded-[var(--kk-radius-lg)] border px-4 py-3 text-center shadow-[var(--kk-shadow-soft)] hover:-translate-y-0.5 hover:bg-[color:var(--color-warm)] ${toneClasses}`}
    >
      <p className="text-sm font-medium leading-snug">{fullName}</p>
      {roleLabel ? <p className="mt-1 text-xs font-medium text-[color:var(--color-clay)]">{roleLabel}</p> : null}
    </Link>
  );
}

export function FamilyTreeFocus({ focusPerson, parents, spouse, childMembers }: FamilyTreeFocusProps) {
  return (
    <section
      data-testid="family-tree-visual"
      className="space-y-8 overflow-x-auto rounded-[var(--kk-radius-xl)] border border-[color:rgba(212,184,150,0.4)] bg-[color:var(--kk-surface)] p-6 shadow-[var(--kk-shadow-card)] sm:p-8"
    >
      <p className="rounded-[var(--kk-radius-md)] bg-[color:var(--color-warm)] px-4 py-3 text-sm font-normal leading-relaxed text-[color:var(--kk-muted)]">
        Mode visual ini menampilkan orang tua, pasangan, dan anak dari anggota fokus. Ketuk kartu anggota untuk membuka profil.
      </p>

      <div className="flex min-w-max flex-col items-center gap-8">
        <div className="flex flex-wrap justify-center gap-4">
          {parents.length === 0 ? (
            <p className="rounded-[var(--kk-radius-sm)] bg-[color:var(--color-warm)] px-4 py-2 text-sm font-normal text-[color:var(--kk-muted)]">Belum ada orang tua yang tercatat.</p>
          ) : (
            parents.map((parent) => (
              <TreePersonNode
                key={parent.person_id}
                personId={parent.person_id}
                fullName={parent.full_name}
                roleLabel="Orang Tua"
                testId="tree-parent-node"
              />
            ))
          )}
        </div>

        {parents.length > 0 ? (
          <div data-testid="tree-link-parent-child" className="flex items-center justify-center gap-2 text-xs font-medium text-[color:var(--color-clay)]">
            <span className="h-px w-10 bg-[color:var(--color-sand)]" />
            <span>Hubungan orang tua</span>
            <span className="h-px w-10 bg-[color:var(--color-sand)]" />
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-center gap-4 rounded-[var(--kk-radius-md)] border border-[color:var(--color-sand)] bg-[color:var(--color-warm)] px-5 py-4">
          <TreePersonNode
            personId={focusPerson.id}
            fullName={focusPerson.full_name}
            roleLabel="Anggota Fokus"
            tone="focus"
            testId="tree-root-node"
          />
          {spouse.map((partner) => (
            <div key={partner.person_id} className="flex items-center gap-2">
              <span data-testid="tree-link-spouse" className="text-sm font-medium text-[color:var(--color-clay)]" aria-hidden="true">
                ↔
              </span>
              <TreePersonNode
                personId={partner.person_id}
                fullName={partner.full_name}
                roleLabel="Pasangan"
                testId="tree-spouse-node"
              />
            </div>
          ))}
        </div>

        {childMembers.length > 0 ? (
          <div data-testid="tree-link-parent-child" className="flex items-center justify-center gap-2 text-xs font-medium text-[color:var(--color-clay)]">
            <span className="h-px w-10 bg-[color:var(--color-sand)]" />
            <span>Hubungan anak</span>
            <span className="h-px w-10 bg-[color:var(--color-sand)]" />
          </div>
        ) : null}

        <div className="flex flex-wrap justify-center gap-4">
          {childMembers.length === 0 ? (
            <p className="rounded-[var(--kk-radius-sm)] bg-[color:var(--color-warm)] px-4 py-2 text-sm font-normal text-[color:var(--kk-muted)]">Belum ada anak yang tercatat.</p>
          ) : (
            childMembers.map((child) => (
              <TreePersonNode
                key={child.person_id}
                personId={child.person_id}
                fullName={child.full_name}
                roleLabel="Anak"
                testId="tree-child-node"
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
