# Codex Start Prompt — Kisah Keluarga

You are working on **Kisah Keluarga**, an elderly-friendly family tree and family archive web app.

First, read these files in order before changing anything:
1. `AGENTS.md`
2. `docs/00-overview/PROJECT_SUMMARY.md`
3. `docs/01-product/PRODUCT_REQUIREMENTS.md`
4. `docs/03-architecture/STACK_DECISION.md`
5. `docs/04-data/DATA_MODEL.md`
6. `docs/05-implementation/REPO_STRUCTURE.md`
7. `docs/07-delivery/TASK_BREAKDOWN.md`
8. `docs/07-delivery/CODEX_EXECUTION_GUIDE.md`

Then do the following:
- summarize your understanding of the product in a concise but specific way
- restate the chosen stack and the product constraints
- identify the exact current phase you should start from
- list the files you expect to create or modify first
- explain risks and assumptions before implementation

Important product rules:
- the app must feel simple for elderly users
- mobile-first is mandatory
- tree view is important but must not be the only navigation method
- add/edit/remove flows must feel fluid and contextual
- each family member must support profile picture
- destructive delete should default to archive or a safe alternative
- family data should feel private and role-aware
- do not jump to advanced graph visualization before CRUD is stable

Technical direction:
- use Next.js App Router + TypeScript
- use Supabase for Postgres, Auth, and Storage
- use Tailwind CSS + shadcn/ui
- use React Hook Form + Zod for forms and validation
- use Cytoscape.js only when the tree-view phase is reached
- add PWA only after core MVP is stable

Execution style:
- work in small, reviewable phases
- keep components feature-oriented and understandable
- avoid speculative abstractions
- favor production-minded naming from the beginning
- after each phase, summarize changes, affected files, test steps, and follow-up risks

Do not implement the whole project at once.
Start by identifying the first task from `/tasks` that should be executed now, then propose a tight implementation plan for only that phase.
