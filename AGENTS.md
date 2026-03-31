# AGENTS.md — Kisah Keluarga

This repository contains the implementation of **Kisah Keluarga**, an elderly-friendly family tree and family archive web app.

The project direction is already defined in the documentation pack. Before making changes, read the docs below in order.

## Required Reading Order
1. `docs/00-overview/PROJECT_SUMMARY.md`
2. `docs/01-product/PRODUCT_REQUIREMENTS.md`
3. `docs/03-architecture/STACK_DECISION.md`
4. `docs/04-data/DATA_MODEL.md`
5. `docs/05-implementation/REPO_STRUCTURE.md`
6. `docs/07-delivery/TASK_BREAKDOWN.md`
7. `docs/07-delivery/CODEX_EXECUTION_GUIDE.md`

## Product Intent
Kisah Keluarga is not just a technical family tree graph.
It is a **family hub** for:
- member profiles
- relationships
- family tree navigation
- profile photos
- stories and memories
- timeline of family events

The app must feel **simple, warm, and safe**.

## Non-Negotiable Product Rules
- The app must be **elderly-friendly**.
- The app must be **mobile-first**.
- Tree view is important, but **must not be the only navigation method**.
- Add / edit / remove member flows must feel **fluid, local, and low-friction**.
- Each member must support **profile picture**.
- Delete should default to **archive / safe-delete**, not destructive removal.
- Family data must feel **private** and **carefully permissioned**.
- Avoid genealogy-software complexity in the main user experience.

## Chosen Stack
- Next.js (App Router)
- TypeScript
- Vercel
- Supabase Postgres
- Supabase Auth
- Supabase Storage
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Cytoscape.js later for tree view
- PWA after core MVP is stable

## Engineering Principles
- Prefer safe, understandable code over clever abstractions.
- Keep files and components small and feature-oriented.
- Prefer server-centric patterns where appropriate.
- Use strict validation for all writes.
- Keep naming production-minded from the beginning.
- Avoid speculative abstractions and dead code.
- Build core CRUD stability first before advanced visualization.

## Work Mode
Always work in **small phases**.
Do not try to implement the full product in one pass.

Before implementation in each phase:
- explain what you are going to change
- list affected files
- explain assumptions and risks

After implementation in each phase:
- summarize what changed
- list affected files
- explain risks / follow-up items
- explain how to test locally

## Recommended Build Order
1. Foundation and app shell
2. Auth and roles
3. Member CRUD
4. Relationship CRUD and linking flows
5. Profile photo upload and replacement
6. Search and family directory
7. Tree view
8. Stories and timeline
9. Elderly-friendly polish
10. Deployment hardening and production readiness

## UX Rules
- Prioritize large tap targets.
- Keep each screen focused on one primary action.
- Use clear labels instead of technical genealogy jargon.
- Prefer drawers, sheets, or local modals for contextual actions.
- Avoid overcrowded pages.
- Make relationship labels explicit and human-readable.
- Use confirmation for destructive actions, but keep the flow light.
- Preserve a clear way back from every screen.

## Data Rules
- Model family as **people + relationships**, not as a rigid tree only.
- Parent/child and spouse/partner are primary relationship types.
- Sibling relationships should usually be derived, not stored as the primary source of truth.
- Maintain auditability for important changes.
- Keep media references separate from people where possible.

## Delivery Rules
- When a task is large, split it into smaller deliverable steps.
- Prefer completing one task file at a time from `/tasks`.
- If implementation deviates from docs, explain why.
- Do not silently change product direction.

## Reference Task Files
Use the `/tasks` directory as the execution map.
Start from `TASK-00-foundation.md` and move in order unless explicitly instructed otherwise.
