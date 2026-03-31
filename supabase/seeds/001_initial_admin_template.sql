-- Template manual untuk bootstrap admin pertama.
-- Ganti <AUTH_USER_UUID> dengan user id dari Supabase Auth.
-- Jalankan setelah migration user_roles diterapkan.

insert into public.user_roles (user_id, role)
values ('<AUTH_USER_UUID>', 'admin')
on conflict (user_id)
do update set
  role = excluded.role,
  updated_at = timezone('utc', now());
