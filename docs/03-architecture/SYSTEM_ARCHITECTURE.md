# System Architecture

## High-Level Architecture

```text
Browser / Mobile Web (PWA later)
        |
        v
Vercel-hosted Next.js App
        |
        +--> Supabase Auth
        +--> Supabase Postgres
        +--> Supabase Storage
```

## Architecture Notes

### Frontend
- Next.js App Router
- mostly server components
- client components only when needed:
  - forms
  - image preview
  - interactive relationship editing
  - tree visualization

### Backend Logic
- route handlers / server actions
- service layer for domain logic
- Supabase access from server-side only for sensitive operations

### Database
- relational model
- people and relationships stored separately
- derived sibling relationships via shared parents

### Media
- photos stored in Supabase Storage bucket
- metadata stored in database
- URLs handled carefully based on privacy model

### Auth
- Supabase Auth
- role metadata stored in application tables or auth metadata

## Key Architectural Rules
1. Keep critical writes on the server.
2. Avoid exposing privileged keys to the client.
3. Separate profile data from relationship edges.
4. Prefer soft deletion for members.
5. Keep storage strategy independent of UI components.

