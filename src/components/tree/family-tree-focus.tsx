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
  tone?: "default" | "focus";
  testId?: string;
};

function TreePersonNode({ personId, fullName, tone = "default", testId }: TreePersonNodeProps) {
  const toneClasses =
    tone === "focus"
      ? "border-amber-300 bg-amber-50 text-amber-900"
      : "border-slate-200 bg-white text-slate-900";

  return (
    <Link
      href={`/keluarga/${personId}`}
      data-testid={testId}
      className={`block min-h-[64px] rounded-xl border px-4 py-3 text-base font-semibold leading-snug shadow-sm ${toneClasses}`}
    >
      {fullName}
    </Link>
  );
}

export function FamilyTreeFocus({ focusPerson, parents, spouse, childMembers }: FamilyTreeFocusProps) {
  return (
    <section data-testid="family-tree-visual" className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <p className="text-sm leading-relaxed text-slate-600">
        Tampilan ini membantu melihat hubungan inti secara cepat. Untuk pencarian lengkap, tetap gunakan direktori keluarga.
      </p>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Orang Tua</p>
        {parents.length === 0 ? (
          <p className="text-sm text-slate-600">Belum ada orang tua yang tercatat.</p>
        ) : (
          <div className="flex flex-wrap justify-center gap-2">
            {parents.map((parent) => (
              <TreePersonNode
                key={parent.person_id}
                personId={parent.person_id}
                fullName={parent.full_name}
                testId="tree-parent-node"
              />
            ))}
          </div>
        )}
      </div>

      {parents.length > 0 ? (
        <div data-testid="tree-link-parent-child" className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <span className="h-px w-8 bg-slate-300" />
          <span>Relasi orang tua</span>
          <span className="h-px w-8 bg-slate-300" />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <TreePersonNode
          personId={focusPerson.id}
          fullName={focusPerson.full_name}
          tone="focus"
          testId="tree-root-node"
        />
        {spouse.map((partner) => (
          <div key={partner.person_id} className="flex items-center gap-2">
            <span data-testid="tree-link-spouse" className="text-sm text-slate-500" aria-hidden="true">
              ↔
            </span>
            <TreePersonNode
              personId={partner.person_id}
              fullName={partner.full_name}
              testId="tree-spouse-node"
            />
          </div>
        ))}
      </div>

      {childMembers.length > 0 ? (
        <div data-testid="tree-link-parent-child" className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <span className="h-px w-8 bg-slate-300" />
          <span>Relasi anak</span>
          <span className="h-px w-8 bg-slate-300" />
        </div>
      ) : null}

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Anak</p>
        {childMembers.length === 0 ? (
          <p className="text-sm text-slate-600">Belum ada anak yang tercatat.</p>
        ) : (
          <div className="flex flex-wrap justify-center gap-2">
            {childMembers.map((child) => (
              <TreePersonNode
                key={child.person_id}
                personId={child.person_id}
                fullName={child.full_name}
                testId="tree-child-node"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
