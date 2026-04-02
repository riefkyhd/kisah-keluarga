import Link from "next/link";
import { Card } from "@/components/ui/card";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { RelationshipActionsMenu } from "@/components/relationships/relationship-actions-menu";
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
        <ul className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          {items.map((item) => (
            <li
              key={item.person_id + (hasRelationshipId(item) ? `-${item.relationship_id}` : "")}
              className="border-b border-stone-100 p-4 last:border-b-0"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/keluarga/${item.person_id}`}
                    className="block truncate font-semibold text-stone-900 transition-colors hover:text-amber-800"
                  >
                    {item.full_name}
                  </Link>
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{title}</p>
                </div>
                {canManage && archiveAction && hasRelationshipId(item) ? (
                  <RelationshipActionsMenu
                    currentPersonId={currentPersonId}
                    relatedPersonId={item.person_id}
                    relatedPersonName={item.full_name}
                    relationshipId={item.relationship_id}
                    relationshipTypeLabel={title}
                    archiveAction={archiveAction}
                  />
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
            <FormSubmitButton type="submit" className="w-full" pendingLabel="Menyimpan relasi...">
              {submitLabel}
            </FormSubmitButton>
          </form>
        ) : (
          <p className="text-sm text-stone-500">Belum ada kandidat anggota lain untuk ditautkan.</p>
        )
      ) : null}
    </Card>
  );
}
