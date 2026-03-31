# Codex Phase Prompt Template

Use this template when asking Codex to execute a single phase.

---

You are continuing work on **Kisah Keluarga**.

Before making changes, re-read:
- `AGENTS.md`
- `docs/07-delivery/CODEX_EXECUTION_GUIDE.md`
- the specific task file for this phase: `[TASK_FILE_HERE]`

Context:
- product: elderly-friendly family tree + family archive
- stack: Next.js App Router + TypeScript + Supabase + Tailwind + shadcn/ui
- main UX rule: keep the app simple, mobile-first, and friendly for older users
- do not expand scope beyond this phase unless necessary for correctness

Your job in this phase:
1. summarize the exact goal of this phase
2. explain affected files before implementation
3. explain assumptions and risks
4. implement only this phase
5. summarize what changed
6. provide test steps
7. list follow-up items, if any

Additional requirements:
- keep code small and understandable
- do not introduce dead abstractions
- validate all writes
- preserve a smooth add/edit/remove flow
- keep role and privacy implications in mind
- use safe defaults for destructive actions

Phase file to execute:
- `[TASK_FILE_HERE]`

If you notice conflicts between implementation and docs, call them out clearly before proceeding.
