import { createClient } from "@/lib/supabase/server";

type RelationshipRow = {
  id: string;
  from_person_id: string;
  to_person_id: string;
  relationship_type: "parent" | "spouse";
};

type PersonRow = {
  id: string;
  full_name: string;
  is_archived: boolean;
};

export type RelationshipListItem = {
  relationship_id: string;
  person_id: string;
  full_name: string;
  is_archived: boolean;
};

export type SiblingListItem = {
  person_id: string;
  full_name: string;
  is_archived: boolean;
};

export type ProfileRelationships = {
  parents: RelationshipListItem[];
  spouse: RelationshipListItem[];
  children: RelationshipListItem[];
  siblings: SiblingListItem[];
};

export type TreeFocusPerson = {
  id: string;
  full_name: string;
};

export type TreeViewData = {
  focusPerson: TreeFocusPerson | null;
  focusCandidates: TreeFocusPerson[];
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
  children: RelationshipListItem[];
};

export type RelationshipCandidate = {
  id: string;
  full_name: string;
};

function mapPeopleById(rows: PersonRow[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

function sortByName<T extends { full_name: string }>(rows: T[]) {
  return [...rows].sort((a, b) => a.full_name.localeCompare(b.full_name, "id-ID"));
}

async function getPeopleRows(ids: string[]) {
  if (ids.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("people")
    .select("id, full_name, is_archived")
    .in("id", ids);

  if (error) {
    throw new Error("Gagal memuat data anggota terkait.");
  }

  return (data ?? []) as PersonRow[];
}

function normalizeSpousePair(firstId: string, secondId: string) {
  return firstId < secondId
    ? { firstId, secondId }
    : { firstId: secondId, secondId: firstId };
}

export async function listRelationshipCandidates(personId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("people")
    .select("id, full_name")
    .eq("is_archived", false)
    .neq("id", personId)
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error("Gagal memuat kandidat relasi.");
  }

  return (data ?? []) as RelationshipCandidate[];
}

export async function getProfileRelationships(personId: string, includeArchivedPeople = false) {
  const supabase = await createClient();
  const { data: directEdges, error: directEdgesError } = await supabase
    .from("relationships")
    .select("id, from_person_id, to_person_id, relationship_type")
    .eq("is_archived", false)
    .or(`from_person_id.eq.${personId},to_person_id.eq.${personId}`);

  if (directEdgesError) {
    throw new Error("Gagal memuat relasi anggota.");
  }

  const edges = (directEdges ?? []) as RelationshipRow[];
  const parentEdgeRows = edges.filter(
    (edge) => edge.relationship_type === "parent" && edge.to_person_id === personId
  );
  const childEdgeRows = edges.filter(
    (edge) => edge.relationship_type === "parent" && edge.from_person_id === personId
  );
  const spouseEdgeRows = edges.filter((edge) => edge.relationship_type === "spouse");

  const parentIds = parentEdgeRows.map((edge) => edge.from_person_id);
  const childIds = childEdgeRows.map((edge) => edge.to_person_id);
  const spouseIds = spouseEdgeRows.map((edge) =>
    edge.from_person_id === personId ? edge.to_person_id : edge.from_person_id
  );

  let siblingIds: string[] = [];
  if (parentIds.length > 0) {
    const { data: siblingEdges, error: siblingError } = await supabase
      .from("relationships")
      .select("to_person_id")
      .eq("is_archived", false)
      .eq("relationship_type", "parent")
      .in("from_person_id", parentIds)
      .neq("to_person_id", personId);

    if (siblingError) {
      throw new Error("Gagal memuat data saudara.");
    }

    siblingIds = Array.from(new Set((siblingEdges ?? []).map((row) => String(row.to_person_id))));
  }

  const allIds = Array.from(new Set([...parentIds, ...childIds, ...spouseIds, ...siblingIds]));
  const peopleRows = await getPeopleRows(allIds);
  const peopleMap = mapPeopleById(peopleRows);

  const isVisible = (person: PersonRow | undefined): person is PersonRow =>
    Boolean(person && (includeArchivedPeople || person.is_archived === false));

  const parents = sortByName(
    parentEdgeRows
      .map((edge) => {
        const person = peopleMap.get(edge.from_person_id);
        if (!isVisible(person)) {
          return null;
        }

        return {
          relationship_id: edge.id,
          person_id: person.id,
          full_name: person.full_name,
          is_archived: person.is_archived
        } as RelationshipListItem;
      })
      .filter((row): row is RelationshipListItem => row !== null)
  );

  const spouse = sortByName(
    spouseEdgeRows
      .map((edge) => {
        const relatedPersonId = edge.from_person_id === personId ? edge.to_person_id : edge.from_person_id;
        const person = peopleMap.get(relatedPersonId);
        if (!isVisible(person)) {
          return null;
        }

        return {
          relationship_id: edge.id,
          person_id: person.id,
          full_name: person.full_name,
          is_archived: person.is_archived
        } as RelationshipListItem;
      })
      .filter((row): row is RelationshipListItem => row !== null)
  );

  const children = sortByName(
    childEdgeRows
      .map((edge) => {
        const person = peopleMap.get(edge.to_person_id);
        if (!isVisible(person)) {
          return null;
        }

        return {
          relationship_id: edge.id,
          person_id: person.id,
          full_name: person.full_name,
          is_archived: person.is_archived
        } as RelationshipListItem;
      })
      .filter((row): row is RelationshipListItem => row !== null)
  );

  const siblings = sortByName(
    siblingIds
      .map((siblingId) => peopleMap.get(siblingId))
      .filter((person): person is PersonRow => isVisible(person))
      .map(
        (person) =>
          ({
            person_id: person.id,
            full_name: person.full_name,
            is_archived: person.is_archived
          }) as SiblingListItem
      )
  );

  return {
    parents,
    spouse,
    children,
    siblings
  } as ProfileRelationships;
}

export async function getTreeViewData(focusPersonId?: string): Promise<TreeViewData> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("people")
    .select("id, full_name")
    .eq("is_archived", false)
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error("Gagal memuat data anggota untuk tampilan pohon.");
  }

  const focusCandidates = (data ?? []) as TreeFocusPerson[];
  if (focusCandidates.length === 0) {
    return {
      focusPerson: null,
      focusCandidates: [],
      grandparents: [],
      parents: [],
      parentSpouses: [],
      grandparentParentLinks: [],
      parentSpouseLinks: [],
      spouse: [],
      children: []
    };
  }

  const selectedFocusPerson =
    (focusPersonId ? focusCandidates.find((person) => person.id === focusPersonId) : undefined) ??
    focusCandidates[0];

  const relationships = await getProfileRelationships(selectedFocusPerson.id, false);
  const parentIds = relationships.parents.map((parent) => parent.person_id);
  const grandparentParentLinks: Array<{
    grandparent_person_id: string;
    parent_person_id: string;
  }> = [];
  const parentSpouseLinks: Array<{
    parent_person_id: string;
    spouse_person_id: string;
  }> = [];
  let grandparents: RelationshipListItem[] = [];
  let parentSpouses: RelationshipListItem[] = [];

  if (parentIds.length > 0) {
    const { data: grandparentEdges, error: grandparentEdgesError } = await supabase
      .from("relationships")
      .select("id, from_person_id, to_person_id")
      .eq("is_archived", false)
      .eq("relationship_type", "parent")
      .in("to_person_id", parentIds);

    if (grandparentEdgesError) {
      throw new Error("Gagal memuat relasi kakek-nenek.");
    }

    const grandparentRows = (grandparentEdges ?? []) as Array<{
      id: string;
      from_person_id: string;
      to_person_id: string;
    }>;

    const grandparentIds = Array.from(
      new Set(grandparentRows.map((row) => row.from_person_id))
    );
    const grandparentMap = mapPeopleById(await getPeopleRows(grandparentIds));
    grandparents = sortByName(
      grandparentRows
        .map((row) => {
          const person = grandparentMap.get(row.from_person_id);
          if (!person || person.is_archived) {
            return null;
          }

          grandparentParentLinks.push({
            grandparent_person_id: person.id,
            parent_person_id: row.to_person_id
          });

          return {
            relationship_id: row.id,
            person_id: person.id,
            full_name: person.full_name,
            is_archived: person.is_archived
          } as RelationshipListItem;
        })
        .filter((row): row is RelationshipListItem => row !== null)
    );

    const { data: parentSpouseEdges, error: parentSpouseEdgesError } = await supabase
      .from("relationships")
      .select("id, from_person_id, to_person_id")
      .eq("is_archived", false)
      .eq("relationship_type", "spouse")
      .or(
        `from_person_id.in.(${parentIds.join(",")}),to_person_id.in.(${parentIds.join(",")})`
      );

    if (parentSpouseEdgesError) {
      throw new Error("Gagal memuat pasangan orang tua.");
    }

    const parentSpouseRows = (parentSpouseEdges ?? []) as Array<{
      id: string;
      from_person_id: string;
      to_person_id: string;
    }>;

    const parentSpouseIds = Array.from(
      new Set(
        parentSpouseRows.flatMap((row) => {
          if (parentIds.includes(row.from_person_id)) {
            return [row.to_person_id];
          }

          return [row.from_person_id];
        })
      )
    ).filter(
      (personId) =>
        personId !== selectedFocusPerson.id && !parentIds.includes(personId)
    );
    const parentSpouseMap = mapPeopleById(await getPeopleRows(parentSpouseIds));
    const seenSpousePairs = new Set<string>();

    parentSpouses = sortByName(
      parentSpouseRows
        .map((row) => {
          const parentId = parentIds.includes(row.from_person_id)
            ? row.from_person_id
            : row.to_person_id;
          const spouseId = parentId === row.from_person_id ? row.to_person_id : row.from_person_id;

          if (
            spouseId === selectedFocusPerson.id ||
            parentIds.includes(spouseId)
          ) {
            return null;
          }

          const person = parentSpouseMap.get(spouseId);
          if (!person || person.is_archived) {
            return null;
          }

          const pairKey = `${parentId}-${spouseId}`;
          if (seenSpousePairs.has(pairKey)) {
            return null;
          }

          seenSpousePairs.add(pairKey);
          parentSpouseLinks.push({
            parent_person_id: parentId,
            spouse_person_id: spouseId
          });

          return {
            relationship_id: row.id,
            person_id: person.id,
            full_name: person.full_name,
            is_archived: person.is_archived
          } as RelationshipListItem;
        })
        .filter((row): row is RelationshipListItem => row !== null)
    );
  }

  const dedupedGrandparents = Array.from(
    new Map(grandparents.map((item) => [item.person_id, item])).values()
  );
  const dedupedParentSpouses = Array.from(
    new Map(parentSpouses.map((item) => [item.person_id, item])).values()
  );
  const dedupedGrandparentLinks = Array.from(
    new Map(
      grandparentParentLinks.map((link) => [
        `${link.grandparent_person_id}-${link.parent_person_id}`,
        link
      ])
    ).values()
  );
  const dedupedParentSpouseLinks = Array.from(
    new Map(
      parentSpouseLinks.map((link) => {
        const pair = normalizeSpousePair(link.parent_person_id, link.spouse_person_id);
        return [`${pair.firstId}-${pair.secondId}`, link];
      })
    ).values()
  );

  return {
    focusPerson: selectedFocusPerson,
    focusCandidates,
    grandparents: dedupedGrandparents,
    parents: relationships.parents,
    parentSpouses: dedupedParentSpouses,
    grandparentParentLinks: dedupedGrandparentLinks,
    parentSpouseLinks: dedupedParentSpouseLinks,
    spouse: relationships.spouse,
    children: relationships.children
  };
}
