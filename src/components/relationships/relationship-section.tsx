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
  returnTo?: string;
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
  archiveAction,
  returnTo
}: RelationshipSectionProps) {
  const showAdd = canManage && showAddForm && Boolean(addAction);

  return (
    <Card data-testid={testId} className="space-y-4 border-[color:rgba(212,184,150,0.4)]">
      <header className="space-y-1">
        <h3 className="text-lg text-[color:var(--color-bark)]">{title}</h3>
        <p className="text-sm font-normal leading-relaxed text-[color:var(--kk-muted)]">{description}</p>
      </header>

      {items.length === 0 ? (
        <p className="rounded-[var(--kk-radius-md)] border border-dashed border-[color:var(--color-sand)] bg-[color:var(--color-warm)] px-4 py-3 text-sm font-normal leading-relaxed text-[color:var(--kk-muted)]">
          {emptyText}
        </p>
      ) : (
        <ul className="overflow-hidden rounded-[var(--kk-radius-md)] border border-[color:rgba(212,184,150,0.4)] bg-[color:var(--kk-surface)]">
          {items.map((item) => (
            <li
              key={item.person_id + (hasRelationshipId(item) ? `-${item.relationship_id}` : "")}
              className="border-b border-[color:rgba(212,184,150,0.4)] p-4 last:border-b-0"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/keluarga/${item.person_id}`}
                    className="block truncate font-medium text-[color:var(--color-bark)] hover:text-[color:var(--color-clay)]"
                  >
                    {item.full_name}
                  </Link>
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[color:var(--color-clay)]">{title}</p>
                </div>
                {canManage && archiveAction && hasRelationshipId(item) ? (
                  <RelationshipActionsMenu
                    currentPersonId={currentPersonId}
                    relatedPersonId={item.person_id}
                    relatedPersonName={item.full_name}
                    relationshipId={item.relationship_id}
                    relationshipTypeLabel={title}
                    archiveAction={archiveAction}
                    returnTo={returnTo}
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {showAdd ? (
        candidates.length > 0 ? (
          <form action={addAction} className="space-y-3 rounded-[var(--kk-radius-md)] border border-[color:var(--color-sand)] bg-[color:var(--color-warm)] p-4">
            <input type="hidden" name="person_id" value={currentPersonId} />
            {returnTo ? <input type="hidden" name="return_to" value={returnTo} /> : null}
            <label className="block space-y-2 text-sm font-medium text-[color:var(--color-bark)]">
              {addLabel}
              <select
                required
                name="related_person_id"
                className="w-full rounded-[var(--kk-radius-sm)] border border-[color:var(--color-sand)] bg-[color:var(--kk-surface)] px-4 py-3 text-sm text-[color:var(--color-bark)] outline-none focus:ring-2 focus:ring-[color:var(--kk-focus)]"
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
          <p className="text-sm font-normal text-[color:var(--kk-muted)]">Belum ada kandidat anggota lain untuk ditautkan.</p>
        )
      ) : null}
    </Card>
  );
}
