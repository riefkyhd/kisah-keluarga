# Kisah Keluarga

Fondasi awal web app keluarga besar yang **mobile-first** dan **ramah lansia**.

Phase aktif saat ini: **TASK-04 Profile Photos and Media (minimal)**.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui foundation
- Supabase (Postgres, Auth, Storage)
- Vercel (deployment nanti, belum dibahas di phase ini)

## Scope TASK-00 + TASK-01 + TASK-02 + TASK-03 + TASK-04
Yang sudah disiapkan:
- bootstrap app Next.js
- setup Tailwind + konfigurasi dasar shadcn/ui
- helper Supabase client/server
- login flow sederhana (email magic link)
- auth callback route (`/callback`)
- role guard server-side untuk route admin
- migration awal `user_roles`
- migration awal `people`
- direktori keluarga (`/keluarga`)
- profil anggota (`/keluarga/[personId]`)
- tambah anggota (`/anggota-baru`)
- edit + arsip/pulihkan anggota (`/anggota/[personId]/edit`)
- tautkan relasi kontekstual dari profil (`orang tua`, `pasangan`, `anak`)
- tampilan relasi profil (`orang tua`, `pasangan`, `anak`, `saudara` turunan)
- upload/ganti/hapus foto profil anggota (editor/admin)
- tampilan foto profil pada kartu direktori dan halaman profil anggota
- baseline folder `supabase/` (`migrations`, `seeds`, `policies`)
- `.env.example`

Yang **belum** diimplementasikan:
- tree visualization
- stories/timeline
- PWA
- production hardening/deployment logic

## Local Setup
1. Install dependency:
   ```bash
   npm install
   ```
2. Siapkan environment:
   ```bash
   cp .env.example .env.local
   ```
3. Isi nilai Supabase pada `.env.local`.
4. Di Supabase Dashboard, pastikan Auth Redirect URLs memuat:
   - `http://localhost:3000/callback`
   - URL deploy kamu + `/callback` (contoh: `https://your-app.vercel.app/callback`)
5. (Opsional, untuk admin pertama) jalankan template:
   - `supabase/seeds/001_initial_admin_template.sql`
   - ganti `<AUTH_USER_UUID>` dengan user id dari Supabase Auth
6. Jalankan migration:
   - `supabase/migrations/20260331113000_create_people.sql`
   - `supabase/migrations/20260401013000_create_relationships.sql`
   - `supabase/migrations/20260401030000_add_profile_photo_to_people_and_member_photos_bucket.sql`
7. Jalankan app:
   ```bash
   npm run dev
   ```
8. Validasi lint:
   ```bash
   npm run lint
   ```

## Automated Testing (E2E)
Testing otomatis menggunakan Playwright dengan auth bootstrap **khusus test runner** (Node-side), tanpa route backdoor di app runtime.

Prasyarat:
1. `.env.local` berisi nilai valid:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
2. Migration sudah diterapkan:
   - `supabase/migrations/20260331100000_create_user_roles.sql`
   - `supabase/migrations/20260331113000_create_people.sql`
   - `supabase/migrations/20260401013000_create_relationships.sql`
   - `supabase/migrations/20260401030000_add_profile_photo_to_people_and_member_photos_bucket.sql`
3. Install browser Playwright (sekali):
   ```bash
   npx playwright install chromium
   ```

Perintah test:
```bash
npm run test:smoke
npm run test:e2e
```

Catatan keamanan:
- Auth produksi tetap magic-link biasa.
- `ENABLE_TEST_AUTH_BOOTSTRAP=true` hanya dipakai oleh script test untuk helper Node-side.
- `SUPABASE_SERVICE_ROLE_KEY` tidak dipakai di browser/client bundle.

## Initial Routes
- `/` -> public home placeholder
- `/login` -> kirim magic link login
- `/callback` -> tukar auth code menjadi session
- `/keluarga` -> direktori anggota aktif
- `/keluarga/[personId]` -> profil anggota
- `/anggota-baru` -> form tambah anggota (editor/admin)
- `/anggota/[personId]/edit` -> form edit + arsip/pulihkan (editor/admin)
- `/admin` -> route terlindungi admin (server-side guard)

## Dokumen Referensi
Urutan dokumen utama sebelum lanjut ke task berikutnya:
1. `docs/00-overview/PROJECT_SUMMARY.md`
2. `docs/01-product/PRODUCT_REQUIREMENTS.md`
3. `docs/03-architecture/STACK_DECISION.md`
4. `docs/04-data/DATA_MODEL.md`
5. `docs/05-implementation/REPO_STRUCTURE.md`
6. `docs/07-delivery/TASK_BREAKDOWN.md`
7. `docs/07-delivery/CODEX_EXECUTION_GUIDE.md`
