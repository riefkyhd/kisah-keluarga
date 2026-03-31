create extension if not exists pgcrypto;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  role text not null default 'viewer',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint user_roles_role_check check (
    role in ('viewer', 'contributor', 'editor', 'admin')
  )
);

create index if not exists idx_user_roles_role on public.user_roles (role);

alter table public.user_roles enable row level security;

revoke all on table public.user_roles from anon;
revoke all on table public.user_roles from authenticated;
grant select on table public.user_roles to authenticated;

drop policy if exists user_roles_select_own on public.user_roles;
create policy user_roles_select_own
  on public.user_roles
  for select
  to authenticated
  using (auth.uid() = user_id);
