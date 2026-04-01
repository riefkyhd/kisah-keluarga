import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <Card data-testid={testId} className="space-y-4 rounded-[2rem] border-stone-100 p-5 sm:p-6">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
        <p className="text-sm leading-relaxed text-stone-600">{description}</p>
      </header>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-sm leading-relaxed text-stone-600">
          {emptyText}
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.person_id + (hasRelationshipId(item) ? `-${item.relationship_id}` : "")}
              className="rounded-2xl border border-stone-200 bg-stone-50 p-3.5"
            >
              <div className="flex items-center justify-between gap-3">
                <Link href={`/keluarga/${item.person_id}`} className="font-medium text-stone-900 hover:text-amber-800">
                  {item.full_name}
                </Link>
                {canManage && archiveAction && hasRelationshipId(item) ? (
                  <form action={archiveAction}>
                    <input type="hidden" name="person_id" value={currentPersonId} />
                    <input type="hidden" name="relationship_id" value={item.relationship_id} />
                    <Button type="submit" size="sm" variant="outline" className="text-xs">
                      Arsipkan Relasi
                    </Button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {showAdd ? (
        candidates.length > 0 ? (
          <form action={addAction} className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <input type="hidden" name="person_id" value={currentPersonId} />
            <label className="block space-y-2 text-sm font-semibold text-stone-800">
              {addLabel}
              <select
                required
                name="related_person_id"
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none ring-amber-200 focus:border-amber-400 focus:ring-2"
              >
                <option value="">Pilih anggota keluarga</option>
                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.full_name}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" className="w-full">
              {submitLabel}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-stone-500">Belum ada kandidat anggota lain untuk ditautkan.</p>
        )
      ) : null}
    </Card>
  );
}
