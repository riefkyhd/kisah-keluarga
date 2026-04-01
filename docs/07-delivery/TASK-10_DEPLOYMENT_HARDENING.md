# TASK-10 Deployment & Hardening (Vercel + Supabase)

Dokumen ini merangkum hasil verifikasi aktual (MCP), perubahan otomatis yang diterapkan, serta follow-up manual sebelum go-live.

## 1) Verified Current Configuration (MCP-verified)

### Vercel
- Team terdeteksi: `team_5J10qMqQ3jqREkEYdXygdDJk` (`Riefky Hadid's projects`).
- Daftar project yang terlihat saat audit: `egg-order-app`, `backend`, `muhammad-hadid`.
- Belum ada project yang teridentifikasi jelas sebagai repo `kisah-keluarga`.
- Percobaan auto-action `deploy_to_vercel` via MCP mengembalikan instruksi CLI (`vercel deploy`) dan tidak membuat deployment otomatis dari session ini.

### Supabase
- Project URL terverifikasi: `https://tgxiuhyspqwojfqeypii.supabase.co`.
- Publishable keys tersedia (legacy anon + publishable key modern).
- RLS aktif untuk tabel inti:
  - `public.user_roles`
  - `public.people`
  - `public.relationships`
  - `public.stories`
  - `storage.objects`
- Kebijakan write role-aware terverifikasi:
  - `people`, `relationships`, `stories` insert/update hanya editor/admin.
  - `storage.objects` bucket `member-photos` insert/update/delete hanya editor/admin.
  - read inti bersifat authenticated-only.

### Security Advisor (Supabase)
- Temuan security aktif:
  - `Leaked Password Protection Disabled` (Auth setting) — level `WARN`.

### Performance Advisor (Supabase)
- Temuan non-blocking:
  - unindexed FK pada kolom audit (`created_by`, `updated_by`).
  - RLS initplan performance warnings (`auth.uid()` pattern).
  - beberapa unused index info.

## 2) Automatic Changes Applied in TASK-10

## Env hardening
- `.env.example` dipisah jelas menjadi:
  - public env
  - server-only secret
  - dev/test-only flags
- `ENABLE_DEV_DUMMY_LOGIN=false` dan `ENABLE_TEST_AUTH_BOOTSTRAP=false` ditegaskan sebagai default production-safe.

## Next.js hardening
- `next.config.ts`:
  - `poweredByHeader: false`
  - baseline response security headers:
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: DENY`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - header khusus `/sw.js`:
    - `Cache-Control: no-cache, no-store, must-revalidate`

## 3) Manual Follow-ups Required (No Guessing)

### Vercel
1. Link/deploy repo ini ke project Vercel yang benar (`kisah-keluarga`) via Git integration atau CLI.
2. Set env pada Vercel (`Production` dan `Preview`) sesuai tabel env di README.
3. Verifikasi domain final production dan preview branch domains.

### Supabase Auth
1. Pastikan Auth Redirect URLs mencakup:
   - Preview domain Vercel: `https://<preview-domain>/callback`
   - Production domain: `https://<production-domain>/callback`
2. Aktifkan Leaked Password Protection di Supabase Auth settings.

### Secrets
1. Pastikan `SUPABASE_SERVICE_ROLE_KEY` hanya ada di server environment (Vercel), tidak pernah di client.
2. Jangan aktifkan `ENABLE_DEV_DUMMY_LOGIN` di environment publik.

## 4) Accepted Risks / Deferred Hardening

- Tidak ada perubahan policy SQL/migration pada TASK-10 karena tidak ditemukan critical exploit yang butuh patch mendesak.
- Temuan performance advisor (RLS initplan dan unindexed FK audit columns) ditunda karena bukan blocker go-live MVP.
- Tidak menambah CSP ketat pada fase ini untuk menghindari breakage tanpa audit resource policy menyeluruh.

## 5) Smoke Checklist (Preview & Production)

Gunakan checklist ini setelah deploy ke Vercel:

1. Auth:
   - login magic link berhasil
   - callback `/callback` menukar session dengan benar
2. Directory/Profile:
   - `/keluarga` load
   - `/keluarga/[personId]` load
3. Relationships:
   - editor/admin bisa tambah parent/spouse/child
   - archive relasi berfungsi
4. Photos:
   - upload/replace/remove foto berjalan (editor/admin)
   - viewer hanya read
5. Search:
   - `?q=` filter bekerja
   - archived member tersembunyi default
6. Tree:
   - `/pohon` load
   - klik node menuju profil
7. Stories:
   - timeline read
   - create/edit/archive story (editor/admin)
8. Role boundaries:
   - viewer tidak bisa route write
   - admin route tetap admin-only
9. PWA:
   - `/manifest.webmanifest` tersedia
   - `/icon` dan `/apple-icon` tersedia
   - `/sw.js` tersedia dan header cache sesuai
   - `/offline.html` tersedia
10. Service worker sanity:
    - update SW tidak stale (karena no-store header)
    - offline fallback hanya untuk navigasi saat jaringan gagal

## 6) Preview vs Production Requirements

### Preview (branch deployments)
- `NEXT_PUBLIC_APP_URL` harus menunjuk ke URL preview deployment yang sedang diuji.
- Redirect URL Supabase Auth harus mencakup domain preview terkait.
- `ENABLE_DEV_DUMMY_LOGIN=false`.
- `ENABLE_TEST_AUTH_BOOTSTRAP=false`.

### Production
- `NEXT_PUBLIC_APP_URL` harus domain final produksi.
- Redirect URL Supabase Auth harus mencakup domain produksi final.
- `SUPABASE_SERVICE_ROLE_KEY` diset di server env Vercel saja.
- Semua dev/test flags wajib tetap `false`.
- Jalankan smoke checklist penuh sebelum mengumumkan go-live.
