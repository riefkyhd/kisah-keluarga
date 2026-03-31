import Link from "next/link";
import type { RelationshipCandidate, RelationshipListItem, SiblingListItem } from "@/server/queries/relationships";

type RelationshipSectionProps = {
  title: string;
  description: string;
  emptyText: string;
  currentPersonId: string;
  items: RelationshipListItem[] | SiblingListItem[];
  canManage: boolean;
  testId: string;
  candidates?: RelationshipCandidate[];
  showAddForm?: boolean;
  addLabel?: string;
  submitLabel?: string;
  addAction?: (formData: FormData) => Promise<void>;
  archiveAction?: (formData: FormData) => Promise<void>;
};

function hasRelationshipId(
  item: RelationshipListItem | SiblingListItem
): item is RelationshipListItem {
  return "relationship_id" in item;
}

export function RelationshipSection({
  title,
  description,
  emptyText,
  currentPersonId,
  items,
  canManage,
  testId,
  candidates = [],
  showAddForm = true,
  addLabel = "Pilih anggota",
  submitLabel = "Tambah Relasi",
  addAction,
  archiveAction
}: RelationshipSectionProps) {
  const showAdd = canManage && showAddForm && Boolean(addAction);

  return (
    <section data-testid={testId} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-700">{description}</p>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.person_id + (hasRelationshipId(item) ? `-${item.relationship_id}` : "")}
              className="rounded-lg border border-slate-100 bg-slate-50 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <Link href={`/keluarga/${item.person_id}`} className="font-medium text-slate-900">
                  {item.full_name}
                </Link>
                {canManage && archiveAction && hasRelationshipId(item) ? (
                  <form action={archiveAction}>
                    <input type="hidden" name="person_id" value={currentPersonId} />
                    <input type="hidden" name="relationship_id" value={item.relationship_id} />
                    <button
                      type="submit"
                      className="rounded-md border border-amber-300 bg-white px-3 py-1 text-xs font-semibold text-amber-800"
                    >
                      Arsipkan Relasi
                    </button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {showAdd ? (
        candidates.length > 0 ? (
          <form action={addAction} className="space-y-2 rounded-lg border border-slate-200 p-3">
            <input type="hidden" name="person_id" value={currentPersonId} />
            <label className="block space-y-2 text-sm font-medium text-slate-800">
              {addLabel}
              <select
                required
                name="related_person_id"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-amber-200 focus:border-amber-400 focus:ring-2"
              >
                <option value="">Pilih anggota keluarga</option>
                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.full_name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white"
            >
              {submitLabel}
            </button>
          </form>
        ) : (
          <p className="text-sm text-slate-500">Belum ada kandidat anggota lain untuk ditautkan.</p>
        )
      ) : null}
    </section>
  );
}
