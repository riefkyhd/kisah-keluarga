"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FamilyTree } from "@/components/FamilyTree";
import {
  buildCanvasHref,
  CANVAS_TRANSIENT_QUERY_KEYS,
  clearCanvasKeys,
  cloneCanvasParams,
  ensureCanvasFocus
} from "@/lib/canvas/query-state";
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
    const params = cloneCanvasParams(searchParams);
    clearCanvasKeys(params, CANVAS_TRANSIENT_QUERY_KEYS);
    ensureCanvasFocus(params, focusPersonId);
    params.set("memberId", memberId);
    router.push(buildCanvasHref(params), { scroll: false });
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
