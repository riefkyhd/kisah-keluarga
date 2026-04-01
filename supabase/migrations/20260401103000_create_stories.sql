create extension if not exists pgcrypto;

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people (id) on delete cascade,
  title text not null,
  body text not null,
  event_date date null,
  is_archived boolean not null default false,
  created_by uuid null references auth.users (id) on delete set null,
  updated_by uuid null references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint stories_title_not_blank check (char_length(trim(title)) > 0),
  constraint stories_body_not_blank check (char_length(trim(body)) > 0)
);

create index if not exists idx_stories_timeline
  on public.stories (is_archived, event_date desc, created_at desc);

create index if not exists idx_stories_person_active
  on public.stories (person_id, is_archived, event_date desc, created_at desc);

alter table public.stories enable row level security;

revoke all on table public.stories from anon;
revoke all on table public.stories from authenticated;
grant select, insert, update on table public.stories to authenticated;

drop policy if exists stories_select_authenticated on public.stories;
create policy stories_select_authenticated
  on public.stories
  for select
  to authenticated
  using (auth.uid() is not null);

drop policy if exists stories_insert_editor_admin on public.stories;
create policy stories_insert_editor_admin
  on public.stories
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

drop policy if exists stories_update_editor_admin on public.stories;
create policy stories_update_editor_admin
  on public.stories
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
