import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FamilyTree } from "@/components/FamilyTree";
import { FocusPersonCombobox } from "@/components/tree/focus-person-combobox";
import { requireViewer } from "@/lib/permissions/guards";
import { getTreeViewData } from "@/server/queries/relationships";

type HomeTreePageProps = {
  searchParams: Promise<{
    personId?: string;
  }>;
};

function normalizeFocusPersonId(personId?: string) {
  if (!personId) {
    return "";
  }

  return personId.trim();
}

export default async function PublicHomePage({ searchParams }: HomeTreePageProps) {
  await requireViewer("/");
  const query = await searchParams;
  const focusPersonId = normalizeFocusPersonId(query.personId);
  const treeData = await getTreeViewData(focusPersonId);

  return (
    <section className="flex min-h-[calc(100dvh-11rem)] flex-col gap-5">
      <h1 data-testid="tree-page-heading" className="sr-only">
        Pohon Keluarga
      </h1>

      <div className="grid gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]">
        {treeData.focusCandidates.length > 0 ? (
          <Card className="h-fit rounded-[var(--kk-radius-lg)] border-[color:rgba(212,184,150,0.4)] p-5 shadow-[var(--kk-shadow-card)] sm:p-6">
            <FocusPersonCombobox
              candidates={treeData.focusCandidates}
              selectedPersonId={treeData.focusPerson?.id ?? ""}
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/keluarga"
                className="inline-flex min-h-12 items-center justify-center rounded-[var(--kk-radius-md)] border border-[color:var(--color-sand)] bg-[color:var(--kk-surface)] px-4 py-3 text-sm font-medium text-[color:var(--color-bark)] hover:bg-[color:var(--color-warm)]"
              >
                Buka Direktori Keluarga
              </Link>
              <Link
                href="/timeline"
                className="inline-flex min-h-12 items-center justify-center rounded-[var(--kk-radius-md)] border border-[color:var(--color-sand)] bg-[color:var(--kk-surface)] px-4 py-3 text-sm font-medium text-[color:var(--color-bark)] hover:bg-[color:var(--color-warm)]"
              >
                Buka Timeline Cerita
              </Link>
            </div>
          </Card>
        ) : null}

        {treeData.focusPerson ? (
          <FamilyTree
            focusPerson={treeData.focusPerson}
            grandparents={treeData.grandparents}
            parents={treeData.parents}
            parentSpouses={treeData.parentSpouses}
            grandparentParentLinks={treeData.grandparentParentLinks}
            parentSpouseLinks={treeData.parentSpouseLinks}
            spouse={treeData.spouse}
            childMembers={treeData.children}
            canvasHeightClassName="h-[calc(100dvh-14rem)] min-h-[520px]"
          />
        ) : (
          <EmptyState
            title="Belum ada anggota aktif"
            description="Belum ada anggota aktif untuk ditampilkan di pohon keluarga."
          />
        )}
      </div>
    </section>
  );
}
