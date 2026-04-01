import Link from "next/link";
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
    <section className="space-y-4">
      <p className="text-sm font-medium uppercase tracking-wide text-amber-700">Mode Visual</p>
      <h2 data-testid="tree-page-heading" className="text-2xl font-semibold text-slate-900">
        Pohon Keluarga
      </h2>
      <p className="text-slate-700">
        Gunakan tampilan ini untuk memahami struktur keluarga secara cepat. Direktori dan profil tetap menjadi alur utama untuk pencarian dan pengelolaan data.
      </p>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/keluarga"
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800"
        >
          Buka Direktori Keluarga
        </Link>
      </div>

      {treeData.focusCandidates.length > 0 ? (
        <form action="/pohon" method="get" className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <label htmlFor="tree-focus-person" className="block text-sm font-semibold text-slate-900">
            Fokus anggota
          </label>
          <select
            id="tree-focus-person"
            name="personId"
            defaultValue={treeData.focusPerson?.id ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-3 text-base text-slate-900"
          >
            {treeData.focusCandidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.full_name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-amber-500 px-4 py-3 text-sm font-semibold text-white"
          >
            Tampilkan Pohon
          </button>
        </form>
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
              className="inline-block rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800"
            >
              Buka Profil Anggota Fokus
            </Link>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-slate-700">
          Belum ada anggota aktif untuk ditampilkan di pohon keluarga.
        </div>
      )}
    </section>
  );
}
