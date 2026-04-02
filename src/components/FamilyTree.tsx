"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { RelationshipListItem, TreeFocusPerson } from "@/server/queries/relationships";
import {
  buildFamilyTreeLayout,
  TREE_NODE_HEIGHT,
  TREE_NODE_WIDTH
} from "@/lib/tree-layout";

type FamilyTreeProps = {
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
  onNodeClick?: (personId: string) => void;
  canvasHeightClassName?: string;
};

function getInitials(fullName: string) {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return "?";
  }

  const first = words[0]?.[0] ?? "";
  const second = words.length > 1 ? words[words.length - 1]?.[0] ?? "" : "";
  return `${first}${second}`.toUpperCase();
}

function hashHue(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33 + value.charCodeAt(index)) >>> 0;
  }

  return hash % 360;
}

function clampScale(value: number) {
  return Math.min(2.6, Math.max(0.7, value));
}

function truncateTreeName(name: string, maxChars = 14) {
  if (name.length <= maxChars) {
    return name;
  }

  return `${name.slice(0, maxChars - 1)}…`;
}

function getNodeTestId(role: string) {
  if (role === "focus") {
    return "tree-root-node";
  }

  if (role === "parent") {
    return "tree-parent-node";
  }

  if (role === "focus-spouse") {
    return "tree-spouse-node";
  }

  if (role === "child") {
    return "tree-child-node";
  }

  return undefined;
}

export function FamilyTree({
  focusPerson,
  grandparents,
  parents,
  parentSpouses,
  grandparentParentLinks,
  parentSpouseLinks,
  spouse,
  childMembers,
  onNodeClick,
  canvasHeightClassName
}: FamilyTreeProps) {
  const router = useRouter();
  const layout = useMemo(
    () =>
      buildFamilyTreeLayout({
        focusPerson,
        grandparents: grandparents.map((item) => ({
          id: item.person_id,
          full_name: item.full_name
        })),
        parents: parents.map((item) => ({
          id: item.person_id,
          full_name: item.full_name
        })),
        parentSpouses: parentSpouses.map((item) => ({
          id: item.person_id,
          full_name: item.full_name
        })),
        spouse: spouse.map((item) => ({
          id: item.person_id,
          full_name: item.full_name
        })),
        children: childMembers.map((item) => ({
          id: item.person_id,
          full_name: item.full_name
        })),
        grandparentParentLinks,
        parentSpouseLinks
      }),
    [
      focusPerson,
      grandparents,
      parents,
      parentSpouses,
      spouse,
      childMembers,
      grandparentParentLinks,
      parentSpouseLinks
    ]
  );

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<SVGSVGElement>(null);

  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const dragPointerIdRef = useRef<number | null>(null);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null);
  const movedDuringGestureRef = useRef(false);

  const nodeMap = useMemo(() => {
    const map = new Map<string, (typeof layout.nodes)[number]>();
    layout.nodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [layout.nodes]);

  // Auto-center focus person on ID change
  useMemo(() => {
    setPan({ x: 0, y: 0 });
    setScale(1);
  }, [focusPerson.id]);

  const getPointerDistance = () => {
    const points = Array.from(pointersRef.current.values());
    if (points.length < 2) {
      return 0;
    }

    const [first, second] = points;
    return Math.hypot(second.x - first.x, second.y - first.y);
  };

  return (
    <section
      data-testid="family-tree-visual"
      className="space-y-4 rounded-[var(--kk-radius-xl)] border border-[color:var(--color-sand)] bg-[color:var(--kk-surface)] p-4 shadow-[var(--kk-shadow-card)] sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium leading-relaxed text-[color:var(--kk-muted)]">
          Pencet dan geser untuk pindah area, cubit atau gulir untuk perbesar. Ketuk nama untuk lihat profil.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setScale((current) => clampScale(current + 0.2))}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--kk-radius-md)] border border-[color:var(--color-sand)] bg-[color:var(--color-warm)] text-xl font-bold text-[color:var(--color-bark)] hover:bg-[color:var(--color-sand)] active:scale-95 transition-all"
            aria-label="Perbesar"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setScale((current) => clampScale(current - 0.2))}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--kk-radius-md)] border border-[color:var(--color-sand)] bg-[color:var(--color-warm)] text-xl font-bold text-[color:var(--color-bark)] hover:bg-[color:var(--color-sand)] active:scale-95 transition-all"
            aria-label="Perkecil"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => {
              setScale(1);
              setPan({ x: 0, y: 0 });
            }}
            className="h-11 rounded-[var(--kk-radius-md)] border border-[color:var(--color-sand)] bg-[color:var(--color-warm)] px-4 py-2 text-sm font-bold text-[color:var(--color-bark)] hover:bg-[color:var(--color-sand)] active:scale-95 transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[var(--kk-radius-lg)] border border-[color:var(--color-sand)] bg-[color:var(--color-cream)]/70">
        <svg
          ref={containerRef}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className={`w-full touch-none ${canvasHeightClassName ?? "h-[520px]"}`}
          onWheel={(event) => {
            event.preventDefault();
            const zoomDelta = event.deltaY > 0 ? -0.1 : 0.1;
            setScale((current) => clampScale(current + zoomDelta));
          }}
          onPointerDown={(event) => {
            const point = { x: event.clientX, y: event.clientY };
            pointersRef.current.set(event.pointerId, point);

            if (pointersRef.current.size === 1) {
              dragPointerIdRef.current = event.pointerId;
              lastPointerRef.current = point;
              movedDuringGestureRef.current = false;
            }

            if (pointersRef.current.size === 2) {
              pinchRef.current = {
                distance: getPointerDistance(),
                scale
              };
              dragPointerIdRef.current = null;
            }
          }}
          onPointerMove={(event) => {
            if (!pointersRef.current.has(event.pointerId)) {
              return;
            }

            pointersRef.current.set(event.pointerId, {
              x: event.clientX,
              y: event.clientY
            });

            if (pointersRef.current.size === 2 && pinchRef.current) {
              const nextDistance = getPointerDistance();
              if (nextDistance > 0 && pinchRef.current.distance > 0) {
                const ratio = nextDistance / pinchRef.current.distance;
                setScale(clampScale(pinchRef.current.scale * ratio));
              }
              movedDuringGestureRef.current = true;
              return;
            }

            if (dragPointerIdRef.current !== event.pointerId || !lastPointerRef.current) {
              return;
            }

            const deltaX = event.clientX - lastPointerRef.current.x;
            const deltaY = event.clientY - lastPointerRef.current.y;

            if (Math.abs(deltaX) + Math.abs(deltaY) > 5) {
              movedDuringGestureRef.current = true;
            }

            lastPointerRef.current = { x: event.clientX, y: event.clientY };
            setPan((current) => ({
              x: current.x + deltaX / scale,
              y: current.y + deltaY / scale
            }));
          }}
          onPointerUp={(event) => {
            pointersRef.current.delete(event.pointerId);
            if (dragPointerIdRef.current === event.pointerId) {
              dragPointerIdRef.current = null;
              lastPointerRef.current = null;
            }

            if (pointersRef.current.size < 2) {
              pinchRef.current = null;
            }
          }}
          onPointerCancel={(event) => {
            pointersRef.current.delete(event.pointerId);
            if (dragPointerIdRef.current === event.pointerId) {
              dragPointerIdRef.current = null;
              lastPointerRef.current = null;
            }
            if (pointersRef.current.size < 2) {
              pinchRef.current = null;
            }
          }}
        >
          <g transform={`scale(${scale}) translate(${pan.x} ${pan.y})`}>
            {layout.edges.map((edge) => {
              const fromNode = nodeMap.get(edge.fromId);
              const toNode = nodeMap.get(edge.toId);
              if (!fromNode || !toNode) {
                return null;
              }

              if (edge.type === "spouse") {
                const leftNode = fromNode.x < toNode.x ? fromNode : toNode;
                const rightNode = leftNode.id === fromNode.id ? toNode : fromNode;
                const startX = leftNode.x + TREE_NODE_WIDTH / 2;
                const endX = rightNode.x - TREE_NODE_WIDTH / 2;
                const y = leftNode.y;
                const controlDelta = Math.max(18, (endX - startX) * 0.25);

                return (
                  <g key={edge.id}>
                    <path
                      d={`M ${startX} ${y} C ${startX + controlDelta} ${y - 4}, ${endX - controlDelta} ${y - 4}, ${endX} ${y}`}
                      fill="none"
                      stroke="#a38265"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                    />
                    <text
                      x={(startX + endX) / 2}
                      y={y - 8}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#8b5e3c"
                    >
                      ↔
                    </text>
                  </g>
                );
              }

              const fromBottomY = fromNode.y + TREE_NODE_HEIGHT / 2;
              const toTopY = toNode.y - TREE_NODE_HEIGHT / 2;
              const midY = fromBottomY + (toTopY - fromBottomY) * 0.52;
              const controlX = fromNode.x + (toNode.x - fromNode.x) * 0.5;

              return (
                <path
                  key={edge.id}
                  d={`M ${fromNode.x} ${fromBottomY} C ${fromNode.x} ${midY}, ${controlX} ${midY}, ${toNode.x} ${toTopY}`}
                  fill="none"
                  stroke="#c1aa8f"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              );
            })}

            {layout.nodes.map((node) => {
              const testId = getNodeTestId(node.role);
              const nodeLeft = node.x - TREE_NODE_WIDTH / 2;
              const nodeTop = node.y - TREE_NODE_HEIGHT / 2;
              const focusTone = node.role === "focus";
              const hue = hashHue(node.fullName);

              return (
                <g
                  key={node.id}
                  data-testid={testId}
                  onClick={(e) => {
                    if (movedDuringGestureRef.current) {
                      e.preventDefault();
                      return;
                    }

                    if (onNodeClick) {
                      onNodeClick(node.id);
                      return;
                    }

                    router.push(`/keluarga/${node.id}`);
                  }}
                  className="cursor-pointer select-none"
                >
                  <title>{node.fullName}</title>
                  <rect
                    x={nodeLeft}
                    y={nodeTop}
                    width={TREE_NODE_WIDTH}
                    height={TREE_NODE_HEIGHT}
                    rx={14}
                    fill={focusTone ? "#4a3728" : "#ffffff"}
                    stroke={focusTone ? "#4a3728" : "#d4b896"}
                    strokeWidth={2}
                  />
                  <circle
                    cx={nodeLeft + 20}
                    cy={node.y}
                    r={16}
                    fill={focusTone ? "#6b7c5e" : `hsl(${hue} 56% 86%)`}
                    stroke={focusTone ? "#6b7c5e" : `hsl(${hue} 36% 70%)`}
                    strokeWidth={1.4}
                  />
                  <text
                    x={nodeLeft + 20}
                    y={node.y + 4}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill={focusTone ? "#faf7f2" : `hsl(${hue} 32% 28%)`}
                  >
                    {getInitials(node.fullName)}
                  </text>
                  <text
                    x={nodeLeft + 42}
                    y={node.y - 4}
                    fontSize="8.2"
                    fontWeight="600"
                    fill={focusTone ? "#faf7f2" : "#4a3728"}
                  >
                    {truncateTreeName(node.fullName)}
                  </text>
                  <text
                    x={nodeLeft + 42}
                    y={node.y + 11}
                    fontSize="8.8"
                    fill={focusTone ? "#f0eae0" : "#8b5e3c"}
                  >
                    {node.roleLabel}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {parents.length > 0 ? <span data-testid="tree-link-parent-child" className="sr-only">Relasi orang tua</span> : null}
      {childMembers.length > 0 ? <span data-testid="tree-link-parent-child" className="sr-only">Relasi anak</span> : null}
      {spouse.length > 0 ? <span data-testid="tree-link-spouse" className="sr-only">Relasi pasangan</span> : null}
    </section>
  );
}
