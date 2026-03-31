alter table public.people
  add column if not exists profile_photo_path text null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'member-photos',
  'member-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists member_photos_select_authenticated on storage.objects;
create policy member_photos_select_authenticated
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'member-photos');

drop policy if exists member_photos_insert_editor_admin on storage.objects;
create policy member_photos_insert_editor_admin
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'member-photos'
    and exists (
      select 1
      from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role in ('editor', 'admin')
    )
  );

drop policy if exists member_photos_update_editor_admin on storage.objects;
create policy member_photos_update_editor_admin
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'member-photos'
    and exists (
      select 1
      from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role in ('editor', 'admin')
    )
  )
  with check (
    bucket_id = 'member-photos'
    and exists (
      select 1
      from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role in ('editor', 'admin')
    )
  );

drop policy if exists member_photos_delete_editor_admin on storage.objects;
create policy member_photos_delete_editor_admin
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'member-photos'
    and exists (
      select 1
      from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role in ('editor', 'admin')
    )
  );
