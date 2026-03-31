# Kisah Keluarga

Fondasi awal web app keluarga besar yang **mobile-first** dan **ramah lansia**.

Phase aktif saat ini: **TASK-01 Auth and Roles**.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui foundation
- Supabase (Postgres, Auth, Storage)
- Vercel (deployment nanti, belum dibahas di phase ini)

## Scope TASK-00 + TASK-01
Yang sudah disiapkan:
- bootstrap app Next.js
- setup Tailwind + konfigurasi dasar shadcn/ui
- helper Supabase client/server
- login flow sederhana (email magic link)
- auth callback route (`/callback`)
- role guard server-side untuk route admin
- migration awal `user_roles`
- baseline folder `supabase/` (`migrations`, `seeds`, `policies`)
- `.env.example`

Yang **belum** diimplementasikan:
- CRUD anggota keluarga
- relasi keluarga
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
6. Jalankan app:
   ```bash
   npm run dev
   ```
7. Validasi lint:
   ```bash
   npm run lint
   ```

## Initial Routes
- `/` -> public home placeholder
- `/login` -> kirim magic link login
- `/callback` -> tukar auth code menjadi session
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
