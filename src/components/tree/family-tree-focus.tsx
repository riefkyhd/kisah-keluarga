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
      ? "border-amber-300 bg-amber-50 text-amber-900 shadow-amber-100"
      : "border-stone-200 bg-white text-stone-900 shadow-stone-100";

  return (
    <Link
      href={`/keluarga/${personId}`}
      data-testid={testId}
      className={`block min-h-[84px] min-w-[164px] rounded-[1.25rem] border px-4 py-3 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:bg-stone-50 ${toneClasses}`}
    >
      <p className="text-sm font-semibold leading-snug">{fullName}</p>
      {roleLabel ? <p className="mt-1 text-xs font-medium text-stone-500">{roleLabel}</p> : null}
    </Link>
  );
}

export function FamilyTreeFocus({ focusPerson, parents, spouse, childMembers }: FamilyTreeFocusProps) {
  return (
    <section
      data-testid="family-tree-visual"
      className="space-y-8 overflow-x-auto rounded-[2rem] border border-stone-100 bg-white p-6 shadow-sm sm:p-8"
    >
      <p className="rounded-2xl bg-stone-50 px-4 py-3 text-sm leading-relaxed text-stone-600">
        Mode visual ini menampilkan orang tua, pasangan, dan anak dari anggota fokus. Ketuk kartu anggota untuk membuka profil.
      </p>

      <div className="flex min-w-max flex-col items-center gap-8">
        <div className="flex flex-wrap justify-center gap-4">
          {parents.length === 0 ? (
            <p className="rounded-xl bg-stone-50 px-4 py-2 text-sm text-stone-600">Belum ada orang tua yang tercatat.</p>
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
          <div data-testid="tree-link-parent-child" className="flex items-center justify-center gap-2 text-xs font-medium text-stone-500">
            <span className="h-px w-10 bg-stone-300" />
            <span>Hubungan orang tua</span>
            <span className="h-px w-10 bg-stone-300" />
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-amber-100 bg-amber-50/40 px-5 py-4">
          <TreePersonNode
            personId={focusPerson.id}
            fullName={focusPerson.full_name}
            roleLabel="Anggota Fokus"
            tone="focus"
            testId="tree-root-node"
          />
          {spouse.map((partner) => (
            <div key={partner.person_id} className="flex items-center gap-2">
              <span data-testid="tree-link-spouse" className="text-sm font-semibold text-stone-500" aria-hidden="true">
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
          <div data-testid="tree-link-parent-child" className="flex items-center justify-center gap-2 text-xs font-medium text-stone-500">
            <span className="h-px w-10 bg-stone-300" />
            <span>Hubungan anak</span>
            <span className="h-px w-10 bg-stone-300" />
          </div>
        ) : null}

        <div className="flex flex-wrap justify-center gap-4">
          {childMembers.length === 0 ? (
            <p className="rounded-xl bg-stone-50 px-4 py-2 text-sm text-stone-600">Belum ada anak yang tercatat.</p>
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
