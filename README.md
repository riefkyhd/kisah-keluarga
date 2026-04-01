# Kisah Keluarga

Fondasi awal web app keluarga besar yang **mobile-first** dan **ramah lansia**.

Phase aktif saat ini: **TASK-09 PWA & Installability**.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui foundation
- Supabase (Postgres, Auth, Storage)
- Vercel (deployment nanti, belum dibahas di phase ini)

## Scope TASK-00 + TASK-01 + TASK-02 + TASK-03 + TASK-04 + TASK-05 + TASK-06 + TASK-07 + TASK-09
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
- pencarian direktori berbasis server (`?q=`) untuk nama lengkap dan panggilan
- tampilan pohon keluarga fokus (read-only) untuk orang tua/pasangan/anak
- timeline cerita keluarga (`/timeline`)
- detail cerita keluarga (`/cerita/[storyId]`)
- tambah/edit/arsip cerita untuk editor/admin
- cerita terkait pada halaman profil anggota
- web app manifest untuk installability
- icon app untuk browser install + apple touch icon
- dukungan install prompt ringan di beranda saat browser mendukung
- offline fallback dasar (`/offline.html`) via service worker network-first (tanpa cache data privat)
- baseline folder `supabase/` (`migrations`, `seeds`, `policies`)
- `.env.example`

Yang **belum** diimplementasikan:
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
   - Untuk mode QA lokal tanpa OTP inbox (opsional):
     - set `ENABLE_DEV_DUMMY_LOGIN=true`
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
   - `supabase/migrations/20260401103000_create_stories.sql`
7. Jalankan app:
   ```bash
   npm run dev
   ```
8. Validasi lint:
   ```bash
   npm run lint
   ```

## Dev Dummy Login (Manual QA Lokal)
Mode ini membantu QA lokal login cepat sebagai `viewer`, `editor`, atau `admin` tanpa kirim OTP email, tetapi tetap membentuk session Supabase normal via `/callback`.

Cara pakai:
1. Pastikan `.env.local` berisi:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ENABLE_DEV_DUMMY_LOGIN=true`
2. Jalankan app (`npm run dev`) di host lokal (`localhost` / `127.0.0.1`).
3. Buka `/login` lalu klik **Buka Mode Pengujian Lokal**, atau buka langsung `/dev-login`.

Guardrails keamanan:
- Hanya aktif jika `ENABLE_DEV_DUMMY_LOGIN=true`.
- Otomatis nonaktif di `NODE_ENV=production`.
- Route `/dev-login` hard-deny di host non-lokal.
- `SUPABASE_SERVICE_ROLE_KEY` dipakai server-only, tidak dipakai browser/client.

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
   - `supabase/migrations/20260401103000_create_stories.sql`
3. Install browser Playwright (sekali):
   ```bash
   npx playwright install chromium
   ```

Perintah test:
```bash
npm run test:smoke
npm run test:e2e
npm run test:e2e:dev-login
```

Catatan keamanan:
- Auth produksi tetap magic-link biasa.
- `ENABLE_TEST_AUTH_BOOTSTRAP=true` hanya dipakai oleh script test untuk helper Node-side.
- `SUPABASE_SERVICE_ROLE_KEY` tidak dipakai di browser/client bundle.

## Initial Routes
- `/` -> public home placeholder
- `/login` -> kirim magic link login
- `/dev-login` -> login dummy lokal (dev-only, guard ketat)
- `/callback` -> tukar auth code menjadi session
- `/keluarga` -> direktori anggota aktif
- `/pohon` -> tampilan pohon keluarga (fokus anggota)
- `/timeline` -> timeline cerita/momen keluarga
- `/cerita/[storyId]` -> detail cerita keluarga
- `/keluarga/[personId]` -> profil anggota
- `/anggota-baru` -> form tambah anggota (editor/admin)
- `/anggota/[personId]/edit` -> form edit + arsip/pulihkan (editor/admin)
- `/cerita-baru` -> form tambah cerita (editor/admin)
- `/cerita/[storyId]/edit` -> form edit + arsip cerita (editor/admin)
- `/admin` -> route terlindungi admin (server-side guard)

## PWA & Installability (TASK-09)
Yang tersedia sekarang:
- Manifest: `/manifest.webmanifest`
- Icon app: `/icon`, `/icons/icon-192`, `/icons/icon-512`, `/icons/icon-maskable-512`
- Apple icon: `/apple-icon`
- Service worker: `/sw.js` (register otomatis hanya saat production)
- Offline fallback page: `/offline.html`

Cara verifikasi cepat:
1. Jalankan build production:
   ```bash
   npm run build
   npm run start
   ```
2. Buka aplikasi dari browser mobile/supported browser, lalu cek opsi **Add to Home Screen / Install App**.
3. Untuk cek fallback offline, matikan koneksi lalu buka route aplikasi: service worker akan fallback ke `/offline.html` saat request navigasi gagal.

Catatan:
- Fallback offline di phase ini sengaja dasar dan aman-privasi.
- Tidak ada cache API/data Supabase agar tidak menyimpan data keluarga secara stale/offline.

## Dokumen Referensi
Urutan dokumen utama sebelum lanjut ke task berikutnya:
1. `docs/00-overview/PROJECT_SUMMARY.md`
2. `docs/01-product/PRODUCT_REQUIREMENTS.md`
3. `docs/03-architecture/STACK_DECISION.md`
4. `docs/04-data/DATA_MODEL.md`
5. `docs/05-implementation/REPO_STRUCTURE.md`
6. `docs/07-delivery/TASK_BREAKDOWN.md`
7. `docs/07-delivery/CODEX_EXECUTION_GUIDE.md`
