create extension if not exists pgcrypto;

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  nickname text null,
  gender text null,
  birth_date date null,
  death_date date null,
  bio text null,
  is_living boolean not null default true,
  is_archived boolean not null default false,
  created_by uuid null references auth.users (id) on delete set null,
  updated_by uuid null references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint people_full_name_not_blank check (char_length(trim(full_name)) > 0),
  constraint people_gender_check check (
    gender is null or gender in ('male', 'female', 'other')
  ),
  constraint people_birth_before_death check (
    birth_date is null or death_date is null or birth_date <= death_date
  )
);

create index if not exists idx_people_directory
  on public.people (is_archived, full_name);

alter table public.people enable row level security;

revoke all on table public.people from anon;
revoke all on table public.people from authenticated;
grant select, insert, update on table public.people to authenticated;

drop policy if exists people_select_authenticated on public.people;
create policy people_select_authenticated
  on public.people
  for select
  to authenticated
  using (auth.uid() is not null);

drop policy if exists people_insert_editor_admin on public.people;
create policy people_insert_editor_admin
  on public.people
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

drop policy if exists people_update_editor_admin on public.people;
create policy people_update_editor_admin
  on public.people
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
