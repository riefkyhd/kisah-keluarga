"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FamilyTree } from "@/components/FamilyTree";
import type { RelationshipListItem, TreeFocusPerson } from "@/server/queries/relationships";

type TreeCanvasControllerProps = {
  focusPersonId: string;
  focusPerson: TreeFocusPerson;
  grandparents: RelationshipListItem[];
  parents: RelationshipListItem[];
  parentSpouses: RelationshipListItem[];
  grandparentParentLinks: Array<{
    grandparent_person_id: string;
    parent_person_id: string;
  }>;
  parentSpouseLinks: Array<{
    parent_person_id: string;
    spouse_person_id: string;
  }>;
  spouse: RelationshipListItem[];
  childMembers: RelationshipListItem[];
  canvasHeightClassName?: string;
};

const MESSAGE_QUERY_KEYS = [
  "relationship_error",
  "relationship_status",
  "photo_error",
  "photo_status",
  "error",
  "status",
  "created",
  "updated"
] as const;

export function TreeCanvasController({
  focusPersonId,
  focusPerson,
  grandparents,
  parents,
  parentSpouses,
  grandparentParentLinks,
  parentSpouseLinks,
  spouse,
  childMembers,
  canvasHeightClassName
}: TreeCanvasControllerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleNodeClick = (memberId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    MESSAGE_QUERY_KEYS.forEach((key) => params.delete(key));
    if (!params.get("personId")) {
      params.set("personId", focusPersonId);
    }
    params.set("memberId", memberId);
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <FamilyTree
      focusPerson={focusPerson}
      grandparents={grandparents}
      parents={parents}
      parentSpouses={parentSpouses}
      grandparentParentLinks={grandparentParentLinks}
      parentSpouseLinks={parentSpouseLinks}
      spouse={spouse}
      childMembers={childMembers}
      onNodeClick={handleNodeClick}
      canvasHeightClassName={canvasHeightClassName}
    />
  );
}
