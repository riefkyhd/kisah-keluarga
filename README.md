# Kisah Keluarga

Fondasi awal web app keluarga besar yang **mobile-first** dan **ramah lansia**.

Phase aktif saat ini: **TASK-00 Foundation**.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui foundation
- Supabase (Postgres, Auth, Storage)
- Vercel (deployment nanti, belum dibahas di phase ini)

## Scope TASK-00
Yang sudah disiapkan pada fase fondasi:
- bootstrap app Next.js
- setup Tailwind + konfigurasi dasar shadcn/ui
- helper Supabase client/server
- route groups placeholder `(public)`, `(auth)`, `(admin)`
- baseline folder `supabase/` (`migrations`, `seeds`, `policies`)
- `.env.example`

Yang **belum** diimplementasikan:
- auth flow
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
4. Jalankan app:
   ```bash
   npm run dev
   ```
5. Validasi lint:
   ```bash
   npm run lint
   ```

## Initial Routes
- `/` -> public home placeholder
- `/login` -> auth placeholder
- `/admin` -> admin placeholder

## Dokumen Referensi
Urutan dokumen utama sebelum lanjut ke task berikutnya:
1. `docs/00-overview/PROJECT_SUMMARY.md`
2. `docs/01-product/PRODUCT_REQUIREMENTS.md`
3. `docs/03-architecture/STACK_DECISION.md`
4. `docs/04-data/DATA_MODEL.md`
5. `docs/05-implementation/REPO_STRUCTURE.md`
6. `docs/07-delivery/TASK_BREAKDOWN.md`
7. `docs/07-delivery/CODEX_EXECUTION_GUIDE.md`
