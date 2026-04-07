export const TREE_NODE_WIDTH = 130;
export const TREE_NODE_HEIGHT = 48;
const TREE_COLUMN_GAP = 56;
const TREE_ROW_HEIGHT = 120;
const TREE_TOP_PADDING = 56;
const TREE_SIDE_PADDING = 80;

type TreePerson = {
  id: string;
  full_name: string;
};

type TreePersonRole =
  | "grandparent"
  | "parent"
  | "parent-spouse"
  | "focus"
  | "focus-spouse"
  | "child";

export type TreeLayoutNode = {
  id: string;
  fullName: string;
  role: TreePersonRole;
  roleLabel: string;
  row: 0 | 1 | 2 | 3;
  x: number;
  y: number;
};

export type TreeLayoutEdge = {
  id: string;
  fromId: string;
  toId: string;
  type: "parent-child" | "spouse";
};

export type TreeLayoutInput = {
  focusPerson: TreePerson;
  grandparents: TreePerson[];
  parents: TreePerson[];
  parentSpouses: TreePerson[];
  spouse: TreePerson[];
  children: TreePerson[];
  grandparentParentLinks: Array<{
    grandparent_person_id: string;
    parent_person_id: string;
  }>;
  parentSpouseLinks: Array<{
    parent_person_id: string;
    spouse_person_id: string;
  }>;
};

export type TreeLayoutResult = {
  nodes: TreeLayoutNode[];
  edges: TreeLayoutEdge[];
  width: number;
  height: number;
};

function dedupePeople(people: TreePerson[]) {
  const map = new Map<string, TreePerson>();
  people.forEach((person) => {
    if (!map.has(person.id)) {
      map.set(person.id, person);
    }
  });

  return Array.from(map.values());
}

function buildRowOnePeople({
  parents,
  parentSpouses
}: {
  parents: TreePerson[];
  parentSpouses: TreePerson[];
}) {
  return dedupePeople([...parents, ...parentSpouses]);
}

function getRoleLabel(role: TreeLayoutNode["role"]) {
  if (role === "focus") {
    return "Fokus";
  }

  if (role === "focus-spouse") {
    return "Pasangan";
  }

  if (role === "parent") {
    return "Orang Tua";
  }

  if (role === "parent-spouse") {
    return "Pasangan Orang Tua";
  }

  if (role === "grandparent") {
    return "Kakek/Nenek";
  }

  return "Anak";
}

function computeRowPositions(count: number, width: number, rowIndex: number) {
  if (count <= 0) {
    return [];
  }

  const contentWidth = count * TREE_NODE_WIDTH + (count - 1) * TREE_COLUMN_GAP;
  const startX = (width - contentWidth) / 2 + TREE_NODE_WIDTH / 2;
  const y = TREE_TOP_PADDING + rowIndex * TREE_ROW_HEIGHT;

  return Array.from({ length: count }, (_, index) => ({
    x: startX + index * (TREE_NODE_WIDTH + TREE_COLUMN_GAP),
    y
  }));
}

export function buildFamilyTreeLayout(input: TreeLayoutInput): TreeLayoutResult {
  const grandparents = dedupePeople(input.grandparents);
  const parents = dedupePeople(input.parents);
  const parentSpouses = dedupePeople(input.parentSpouses);
  const focusSpouses = dedupePeople(input.spouse);
  const children = dedupePeople(input.children);

  const row0People = grandparents;
  const row1People = buildRowOnePeople({ parents, parentSpouses });
  const row2People = dedupePeople([input.focusPerson, ...focusSpouses]);
  const row3People = children;

  const maxColumns = Math.max(row0People.length, row1People.length, row2People.length, row3People.length, 1);
  const width =
    maxColumns * TREE_NODE_WIDTH + Math.max(0, maxColumns - 1) * TREE_COLUMN_GAP + TREE_SIDE_PADDING * 2;
  const height = TREE_TOP_PADDING + TREE_ROW_HEIGHT * 3 + TREE_NODE_HEIGHT + 64;

  const row0Positions = computeRowPositions(row0People.length, width, 0);
  const row1Positions = computeRowPositions(row1People.length, width, 1);
  const row2Positions = computeRowPositions(row2People.length, width, 2);
  const row3Positions = computeRowPositions(row3People.length, width, 3);

  const parentIds = new Set(parents.map((person) => person.id));
  const focusSpouseIds = new Set(focusSpouses.map((person) => person.id));

  const nodes: TreeLayoutNode[] = [];
  row0People.forEach((person, index) => {
    nodes.push({
      id: person.id,
      fullName: person.full_name,
      row: 0,
      role: "grandparent",
      roleLabel: getRoleLabel("grandparent"),
      ...row0Positions[index]
    });
  });

  row1People.forEach((person, index) => {
    const role: TreeLayoutNode["role"] = parentIds.has(person.id) ? "parent" : "parent-spouse";
    nodes.push({
      id: person.id,
      fullName: person.full_name,
      row: 1,
      role,
      roleLabel: getRoleLabel(role),
      ...row1Positions[index]
    });
  });

  row2People.forEach((person, index) => {
    const role: TreeLayoutNode["role"] = focusSpouseIds.has(person.id) ? "focus-spouse" : "focus";
    nodes.push({
      id: person.id,
      fullName: person.full_name,
      row: 2,
      role,
      roleLabel: getRoleLabel(role),
      ...row2Positions[index]
    });
  });

  row3People.forEach((person, index) => {
    nodes.push({
      id: person.id,
      fullName: person.full_name,
      row: 3,
      role: "child",
      roleLabel: getRoleLabel("child"),
      ...row3Positions[index]
    });
  });

  const nodeIdSet = new Set(nodes.map((node) => node.id));
  const edges: TreeLayoutEdge[] = [];

  input.grandparentParentLinks.forEach((link) => {
    if (!nodeIdSet.has(link.grandparent_person_id) || !nodeIdSet.has(link.parent_person_id)) {
      return;
    }

    edges.push({
      id: `gp-${link.grandparent_person_id}-${link.parent_person_id}`,
      fromId: link.grandparent_person_id,
      toId: link.parent_person_id,
      type: "parent-child"
    });
  });

  parents.forEach((parent) => {
    if (!nodeIdSet.has(parent.id)) {
      return;
    }

    edges.push({
      id: `parent-focus-${parent.id}-${input.focusPerson.id}`,
      fromId: parent.id,
      toId: input.focusPerson.id,
      type: "parent-child"
    });
  });

  children.forEach((child) => {
    if (!nodeIdSet.has(child.id)) {
      return;
    }

    edges.push({
      id: `focus-child-${input.focusPerson.id}-${child.id}`,
      fromId: input.focusPerson.id,
      toId: child.id,
      type: "parent-child"
    });
  });

  input.parentSpouseLinks.forEach((link) => {
    if (!nodeIdSet.has(link.parent_person_id) || !nodeIdSet.has(link.spouse_person_id)) {
      return;
    }

    edges.push({
      id: `ps-${link.parent_person_id}-${link.spouse_person_id}`,
      fromId: link.parent_person_id,
      toId: link.spouse_person_id,
      type: "spouse"
    });
  });

  focusSpouses.forEach((spousePerson) => {
    if (!nodeIdSet.has(spousePerson.id)) {
      return;
    }

    edges.push({
      id: `focus-spouse-${input.focusPerson.id}-${spousePerson.id}`,
      fromId: input.focusPerson.id,
      toId: spousePerson.id,
      type: "spouse"
    });
  });

  return {
    nodes,
    edges,
    width,
    height
  };
}
