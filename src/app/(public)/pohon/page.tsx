import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { requireViewer } from "@/lib/permissions/guards";
import { FamilyTreeFocus } from "@/components/tree/family-tree-focus";
import { getTreeViewData } from "@/server/queries/relationships";

type TreeViewPageProps = {
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

export default async function TreeViewPage({ searchParams }: TreeViewPageProps) {
  await requireViewer("/pohon");
  const query = await searchParams;
  const focusPersonId = normalizeFocusPersonId(query.personId);
  const treeData = await getTreeViewData(focusPersonId);

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Mode Visual"
        title="Pohon Keluarga"
        description="Mode ini membantu membaca hubungan inti dengan cepat. Untuk pencarian dan pengelolaan data, tetap gunakan direktori dan profil anggota."
      />
      <h2 data-testid="tree-page-heading" className="sr-only">
        Pohon Keluarga
      </h2>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/keluarga"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-stone-200 bg-white px-5 py-3 text-base font-semibold text-stone-700 transition-colors hover:bg-stone-50"
        >
          Buka Direktori Keluarga
        </Link>
      </div>

      {treeData.focusCandidates.length > 0 ? (
        <Card className="rounded-[1.75rem] border-stone-100 p-5 shadow-sm sm:p-6">
          <form action="/pohon" method="get" className="space-y-4">
            <label htmlFor="tree-focus-person" className="block text-base font-semibold text-stone-900">
              Fokus anggota
            </label>
            <p className="text-sm leading-relaxed text-stone-600">
              Pilih satu anggota agar pohon tampil lebih ringkas, nyaman dibaca di HP, dan tidak terasa padat.
            </p>
            <div className="flex flex-wrap gap-3">
              <select
                id="tree-focus-person"
                name="personId"
                defaultValue={treeData.focusPerson?.id ?? ""}
                className="min-h-12 flex-1 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-base text-stone-900 outline-none ring-amber-200 focus:border-amber-400 focus:ring-2"
              >
                {treeData.focusCandidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.full_name}
                  </option>
                ))}
              </select>
              <Button type="submit">Tampilkan Pohon</Button>
            </div>
          </form>
        </Card>
      ) : null}

      {treeData.focusPerson ? (
        <>
          <FamilyTreeFocus
            focusPerson={treeData.focusPerson}
            parents={treeData.parents}
            spouse={treeData.spouse}
            childMembers={treeData.children}
          />
          <div>
            <Link
              href={`/keluarga/${treeData.focusPerson.id}`}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-stone-200 bg-white px-5 py-3 text-base font-semibold text-stone-700 transition-colors hover:bg-stone-50"
            >
              Buka Profil Anggota Fokus
            </Link>
          </div>
        </>
      ) : (
        <EmptyState
          title="Belum ada anggota aktif"
          description="Belum ada anggota aktif untuk ditampilkan di pohon keluarga."
        />
      )}
    </section>
  );
}
