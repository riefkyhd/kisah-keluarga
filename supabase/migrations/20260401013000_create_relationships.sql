create extension if not exists pgcrypto;

create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(),
  from_person_id uuid not null references public.people (id) on delete cascade,
  to_person_id uuid not null references public.people (id) on delete cascade,
  relationship_type text not null,
  is_archived boolean not null default false,
  created_by uuid null references auth.users (id) on delete set null,
  updated_by uuid null references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint relationships_no_self_link check (from_person_id <> to_person_id),
  constraint relationships_type_check check (
    relationship_type in ('parent', 'spouse')
  ),
  constraint relationships_spouse_direction_check check (
    relationship_type <> 'spouse' or from_person_id < to_person_id
  )
);

create index if not exists idx_relationships_from_active
  on public.relationships (from_person_id, relationship_type)
  where is_archived = false;

create index if not exists idx_relationships_to_active
  on public.relationships (to_person_id, relationship_type)
  where is_archived = false;

create unique index if not exists uq_relationships_parent_active
  on public.relationships (from_person_id, to_person_id, relationship_type)
  where relationship_type = 'parent' and is_archived = false;

create unique index if not exists uq_relationships_spouse_active
  on public.relationships (from_person_id, to_person_id, relationship_type)
  where relationship_type = 'spouse' and is_archived = false;

alter table public.relationships enable row level security;

revoke all on table public.relationships from anon;
revoke all on table public.relationships from authenticated;
grant select, insert, update on table public.relationships to authenticated;

drop policy if exists relationships_select_authenticated on public.relationships;
create policy relationships_select_authenticated
  on public.relationships
  for select
  to authenticated
  using (auth.uid() is not null);

drop policy if exists relationships_insert_editor_admin on public.relationships;
create policy relationships_insert_editor_admin
  on public.relationships
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role in ('editor', 'admin')
    )
  );

drop policy if exists relationships_update_editor_admin on public.relationships;
create policy relationships_update_editor_admin
  on public.relationships
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role in ('editor', 'admin')
    )
  )
  with check (
    exists (
      select 1
      from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role in ('editor', 'admin')
    )
  );
