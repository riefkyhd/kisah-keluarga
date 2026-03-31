# Database Schema

## Suggested Tables
- `users` (via Supabase Auth)
- `user_roles`
- `family_branches`
- `people`
- `relationships`
- `media_assets`
- `stories`
- `story_people`
- `audit_logs`

## Table Sketches

### `family_branches`
- id (uuid, pk)
- name (text)
- slug (text, unique)
- description (text, nullable)
- ancestor_person_id (uuid, nullable)
- created_at
- updated_at

### `people`
- id (uuid, pk)
- full_name (text, required)
- nickname (text, nullable)
- gender (text, nullable)
- birth_date (date, nullable)
- death_date (date, nullable)
- birth_place (text, nullable)
- bio (text, nullable)
- family_branch_id (uuid, nullable)
- profile_photo_path (text, nullable)
- is_living (boolean, default true)
- is_archived (boolean, default false)
- created_by (uuid, nullable)
- updated_by (uuid, nullable)
- created_at
- updated_at

### `relationships`
- id (uuid, pk)
- from_person_id (uuid, required)
- to_person_id (uuid, required)
- relationship_type (text, required)
- is_primary (boolean, default true)
- start_date (date, nullable)
- end_date (date, nullable)
- notes (text, nullable)
- is_archived (boolean, default false)
- created_by (uuid, nullable)
- updated_by (uuid, nullable)
- created_at
- updated_at

Suggested uniqueness rules:
- prevent exact duplicate active edge combinations where possible
- validate illegal self-links

### `media_assets`
- id (uuid, pk)
- owner_person_id (uuid, nullable)
- storage_bucket (text, required)
- storage_path (text, required)
- media_type (text, required)
- caption (text, nullable)
- uploaded_by (uuid, nullable)
- created_at

### `stories`
- id (uuid, pk)
- title (text, required)
- body (text, required)
- author_user_id (uuid, nullable)
- status (text, required)
- created_at
- updated_at

### `story_people`
- story_id (uuid, pk-part)
- person_id (uuid, pk-part)

### `user_roles`
- id (uuid, pk)
- user_id (uuid, unique)
- role (text, required)
- created_at
- updated_at

### `audit_logs`
- id (uuid, pk)
- actor_user_id (uuid, nullable)
- action_type (text, required)
- entity_type (text, required)
- entity_id (uuid, required)
- summary (text, nullable)
- before_json (jsonb, nullable)
- after_json (jsonb, nullable)
- created_at

## Important Schema Rules
- use UUIDs everywhere
- use `jsonb` only where flexible snapshots are useful, not as a substitute for main relational design
- prefer explicit relationship rows over denormalized giant blobs

