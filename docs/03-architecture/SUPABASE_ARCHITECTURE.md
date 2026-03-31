# Supabase Architecture

## Supabase Services Used
- Postgres database
- Auth
- Storage
- optionally Realtime later (not required for MVP)

## Database Usage
Supabase Postgres stores:
- family members
- relationships
- branches
- stories / memories
- roles
- audit logs
- media metadata

## Storage Usage
Supabase Storage stores:
- profile photos
- story images
- possibly voice notes later

Recommended bucket structure:
- `profile-photos`
- `story-media`
- `system-assets`

## Auth Usage
- email login or magic link / OTP
- roles enforced at app level
- admin routes must be checked server-side

## RLS Direction
Use Row Level Security thoughtfully.
Suggested model:
- authenticated viewers can read allowed public/private family data according to rules
- only editors/admins can write critical tables
- storage access rules aligned with role access

## Important Implementation Note
Do not put all authorization logic only in client-side checks.
Use server-side verification for every important write.

