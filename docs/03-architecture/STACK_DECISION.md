# Stack Decision

## Final Recommended Stack
- **App framework:** Next.js (App Router)
- **Hosting:** Vercel
- **Database:** Supabase Postgres
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Styling:** Tailwind CSS + shadcn/ui
- **Validation:** Zod
- **Forms:** React Hook Form
- **State / server sync:** TanStack Query only where needed
- **Tree visualization:** Cytoscape.js (later phase)
- **PWA:** yes, after MVP

## Why This Stack Was Chosen

### 1. Vercel + Supabase Alignment
User already prefers Vercel + Supabase and has positive precedent with a previous app pattern.
This combo is natural for:
- web apps
- low-to-medium traffic projects
- rapid iteration
- manageable free-to-low-cost usage

### 2. Better Match Than Django for This Hosting Choice
If the project were optimized purely for maintainable Python hosting, Django would remain a very strong option.
However, because hosting direction is explicitly **Vercel + Supabase**, Next.js is the more natural choice.

### 3. Still Lightweight Enough
Next.js can become overcomplicated if misused.
For this project, implementation should stay pragmatic:
- mostly server components
- limited client state
- no unnecessary heavy SPA behavior
- forms kept focused and simple

## What to Avoid
- overusing global state
- forcing every interaction into client-side complexity
- building tree visualization before core CRUD is stable
- overengineering the database like a graph DB too early

## Alternative Stacks Considered

### Django + Render + Supabase
Strong for maintainability, admin flows, and Python familiarity.
Not selected because final hosting direction is Vercel + Supabase.

### Laravel + Livewire
A good server-driven option.
Not selected because no strong migration reason away from the chosen ecosystem.

### Phoenix + LiveView
Technically elegant.
Not selected because complexity and team familiarity cost are not justified for this project.

## Implementation Philosophy
Use the stack in a restrained way:
- server-first
- mobile-first
- CRUD first
- accessibility first
- simplicity first

