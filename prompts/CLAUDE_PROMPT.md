# TASK-12: Clean fixture data from production

File to be affected (probably): 
- supabase/seeds/
- scripts/clean-fixture-data.ts


## Problem
The /keluarga directory shows test entries named "Photo Flow ...",
"Photo Invalid ...", "Photo Large ...", "Photo Viewer ..." — these are
E2E test fixtures that leaked into the live database.

## Goal
1. Create script `scripts/clean-fixture-data.ts` that:
   - Connects via SUPABASE_SERVICE_ROLE_KEY (server-only)
   - Finds people whose full_name starts with "Photo Flow",
     "Photo Invalid", "Photo Large", or "Photo Viewer"
   - Logs matches to stdout for confirmation BEFORE deleting
   - Has a --dry-run flag (default: dry-run ON)
   - Only deletes when --execute flag is explicitly passed
   - Deletes associated relationships and storage objects first
     (to avoid FK constraint errors), then the person rows

2. Add npm script: "clean:fixtures": "ts-node scripts/clean-fixture-data.ts"

3. Update E2E test setup to prefix fixture names with a distinct
   pattern like "[TEST]" so future test data is always identifiable

## Validation
Run `npm run clean:fixtures` (dry-run). Output must list exactly the
fixture entries. Then rerun with --execute. Then verify /keluarga
no longer shows any fixture entries.

---

# TASK-13: Fix photo URLs — public bucket + correct image sizes

File to be affected (probably): 
- src/lib/storage.ts
- src/components/MemberCard.tsx
- src/app/keluarga/page.tsx
- supabase/migrations/

## Problem A: Signed URLs expire in ~30 min
Photos return signed URLs with JWT tokens that expire, causing
broken images on cached/bookmarked pages.

## Problem B: Wrong image size
Directory card avatars request w=3840 but display at ~64px.

## Solution

### 1. Switch member-photos bucket to public
Create migration: `supabase/migrations/20260402_public_member_photos.sql`
```sql
UPDATE storage.buckets
SET public = true
WHERE id = 'member-photos';
```
Review existing RLS policies — public read is OK, write must stay
restricted to authenticated users with editor/admin role.

### 2. Update getPhotoUrl helper in src/lib/storage.ts
Replace getSignedUrl() calls with getPublicUrl(). The returned URL
format will be:
`{SUPABASE_URL}/storage/v1/object/public/member-photos/{path}`
This URL never expires and is CDN-cacheable.

### 3. Fix image sizes in components
- MemberCard (directory list): use width=128, height=128
- Profile page hero: use width=400, height=400
- Pohon chip: use width=64, height=64

## Validation
After migration + deploy:
- Load /keluarga, copy any photo URL, open in incognito 2 hours later
  → must still display (no token expiry)
- Check Network tab: photo requests must be ≤128px for directory cards
- Confirm no "403 Forbidden" errors in Supabase Storage logs

---

# TASK-14: Apply warm family design system + redesign home page

File to be affected (probably): 
- src/app/globals.css
- src/lib/design-tokens.ts
- src/app/page.tsx
- src/components/Navbar.tsx


## Design direction
Warm, editorial, memory-book aesthetic. Think sepia family album meets
modern clean UI. NOT a generic admin panel.

## 1. Add Google Fonts to layout
In src/app/layout.tsx, import via next/font/google:
- Lora (400, 600, italic) — display/headings
- DM Sans (300, 400, 500) — body/UI

## 2. Add CSS tokens to globals.css
```css
:root {
  --color-cream: #FAF7F2;
  --color-warm: #F0EAE0;
  --color-bark: #4A3728;
  --color-clay: #8B5E3C;
  --color-sage: #6B7C5E;
  --color-rust: #C4623A;
  --color-sand: #D4B896;
}
body { background: var(--color-cream); font-family: var(--font-dm-sans); }
```

## 3. Redesign src/app/page.tsx
New structure (server component, no data changes needed yet):
- Navbar (sticky, glass-morphism on scroll)
- Hero: 2-column grid — left: eyebrow + serif h1 + description + 2 CTAs;
  right: mini tree preview card (static, showing Ali↔Wuri + children)
- Stats row: 3 metric cards (anggota, generasi, cerita)
- Quick-nav: 3 cards (Direktori, Pohon, Cerita) with muted icon backgrounds

## 4. Update Navbar component
- Add brand icon (filled square with person silhouette SVG)
- Remove duplicate footer nav — footer should only show credit text
- Hide "Admin" link when user is null (check session prop)
- Add mobile hamburger menu for screens < 640px

## Validation
`npm run build` must pass with 0 TS errors.
Mobile (375px viewport): hero stacks vertically, nav collapses to
hamburger. Lighthouse accessibility score must not drop below existing.

---

# TASK-15: Directory page redesign with generation filter + pagination

File to be affected (probably): 
- src/app/keluarga/page.tsx
- src/components/MemberCard.tsx
- src/components/GenerationFilter.tsx
- src/lib/people.ts

## New MemberCard design
Each card shows:
- Avatar (photo if available, else colored initials circle — color
  derived from name hash for consistency)
- Full name + nickname
- Generation badge (Gen 1 / Gen 2 / Gen 3) — computed from
  depth in family tree
- Role tag (Ayah/Ibu/Anak/etc) — computed from relationships
- Birth date formatted as "16 Jul 1973"
- Child count "2 anak" or "Belum ada anak"

## Generation filter pills
Add client component GenerationFilter with pills:
Semua | Generasi 1 | Generasi 2 | Generasi 3
Filter pushes ?gen=1 query param (URL state, SSR-compatible).

## Pagination
Add LIMIT 20 OFFSET to Supabase query. Add pagination controls:
← Prev  Page 1 of N  Next →
Use searchParams for ?page= (server-rendered).

## Search debounce
Current search triggers on button click. Change to debounced input
(300ms) that updates ?q= param via router.push — no full page reload.

## Add member card button
Show a dashed "+ Tambah Anggota" card at the end of the grid,
visible only for editor/admin roles.

## Validation
- Grid: 3 cols desktop, 2 cols tablet, 1 col mobile
- Generation filter correctly filters server-side
- Pagination: 21 members → 2 pages of 20+1
- Search debounce: type "Ali" → results update after 300ms without
  clicking search button

---

# TASK-16: Interactive family tree visualization

File to be affected (probably): 
- src/app/pohon/page.tsx
- src/components/FamilyTree.tsx
- src/lib/tree-layout.ts

## Current state
/pohon shows a dropdown + text list. This is NOT a tree.

## Goal
A proper visual tree: nodes connected by lines, rendered as SVG,
with a focused member highlighted and their relations shown.

## Implementation approach (NO heavy libs)
Use a custom Sugiyama-style layout computed in src/lib/tree-layout.ts:

1. tree-layout.ts: Given a focusPersonId + all relationships,
   compute (x, y) positions for:
   - grandparents (row 0)
   - parents + their spouses (row 1)
   - focus person + their spouse (row 2)
   - children (row 3)
   Use fixed row heights (120px) and equal column spacing.

2. FamilyTree.tsx: SVG client component that:
   - Renders each person as a rounded rect node (100×60px)
   - Shows avatar circle (40px) + name + role label
   - Draws curved Bezier lines between nodes
   - Highlights focus person with bark color fill
   - Spouse connector: horizontal "↔" line between partners
   - Parent-child: vertical line with branching horizontals
   - Node click: navigate to /keluarga/[personId]
   - Pinch-to-zoom + drag to pan on mobile (touch events)

3. Searchable combobox for focus person selection:
   Replace current dropdown with a Combobox (shadcn Command) that
   filters by typing — no loading all 17+ names.

---

# TASK-17: Cleanup & UX Fix

## Context
App: kisah-keluarga (Next.js + Supabase)
Semua task sebelumnya (TASK-00 s/d TASK-11) sudah selesai.
Login bypass aktif via ENABLE_AUTH_BYPASS=true untuk demo.

## Scope

### FIX-1: Bersihkan test data dari DB
- Identifikasi semua anggota dengan nama mengandung prefix `[TEST]` atau pattern
  `Photo Flow`, `Photo Invalid`, `Photo Viewer`, `Photo Large` di tabel `people`
- Buat script: `scripts/cleanup-test-data.ts`
  - Query semua people dengan nama matching pattern di atas
  - Soft-delete (set archived=true) atau hard-delete dengan konfirmasi
  - Hapus juga foto terkait dari Supabase Storage bucket `member-photos`
- Script harus dry-run by default, tambah flag `--confirm` untuk eksekusi nyata
- Tambahkan ke package.json: `"cleanup:test-data": "npx ts-node scripts/cleanup-test-data.ts"`

### FIX-2: Naikkan TTL signed URL foto profil
- File: semua tempat yang memanggil Supabase storage `createSignedUrl`
- Ubah expiry dari 1800 detik menjadi 3600 (1 jam) minimum
- Pertimbangkan apakah bucket member-photos perlu tetap private atau bisa public
  (foto profil keluarga biasanya ok public jika app sudah auth-gated di level route)
- Jika dijadikan public: hapus signed URL, pakai getPublicUrl, lebih simpel dan tidak expire

### FIX-3: Hapus duplikasi CTA di halaman profil anggota
- File: `src/app/keluarga/[personId]/page.tsx` (atau nama file yang relevan)
- Hapus tombol "Edit / Arsipkan Anggota" di bagian BAWAH halaman (footer CTA area)
- Pertahankan tombol "Edit Profil" di bagian ATAS (header area)
- Hapus juga "Lihat timeline keluarga" dari footer CTA jika sudah ada di navbar

### FIX-4: Sederhanakan beranda
- File: `src/app/page.tsx`
- Hapus duplikasi "Buka Direktori Keluarga" (sudah ada "Anggota" di card atas)
- Gabungkan section "Cerita Keluarga" dan "Mulai dari alur paling sederhana" jadi satu
- Hasil akhir beranda: maksimal 3 CTA utama (Anggota, Pohon, Cerita) + 1 CTA secondary
  untuk editor/admin (Tambah Anggota) yang hanya muncul jika role >= editor

### FIX-5: Sembunyikan CTA editor/admin dari viewer di beranda
- Tombol "Tambah Anggota (Editor/Admin)" di `/` tidak boleh tampil untuk viewer/publik
- Gunakan server component untuk cek role, render kondisional
- Berlaku juga untuk link "Tambah Cerita" di `/timeline`

### FIX-6: Bersihkan menu Admin
- File: `src/app/admin/page.tsx`
- Hapus card "Buka Direktori" dari halaman `/admin` (ini route publik, tidak perlu di admin)
- Hasil akhir: 3 card saja — Kelola Pengguna, Tambah Anggota, Tambah Cerita

## Acceptance Criteria
- [ ] `npm run cleanup:test-data -- --confirm` berhasil hapus semua test member dari DB
- [ ] Foto profil tidak broken setelah 30 menit (signed URL TTL >= 1 jam, atau public URL)
- [ ] Halaman profil anggota tidak punya dua tombol edit yang menuju URL sama
- [ ] Beranda tidak punya dua tombol yang menuju `/keluarga`
- [ ] User dengan role viewer tidak melihat tombol "Tambah Anggota" di beranda
- [ ] Halaman `/admin` tidak punya shortcut ke `/keluarga`
- [ ] `npm run lint` lulus tanpa error baru

## Out of scope
- Perubahan skema DB
- Fitur baru
- Pohon keluarga
- Auth system