# Repo Structure

## Suggested Repository Name
`kisah-keluarga`

## Suggested App Folder Tree

```text
kisah-keluarga/
├── README.md
├── .env.example
├── package.json
├── next.config.ts
├── tsconfig.json
├── public/
│   ├── icons/
│   ├── images/
│   └── manifest.json
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx
│   │   │   ├── keluarga/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [personId]/page.tsx
│   │   │   ├── cabang/
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── cerita/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [storyId]/page.tsx
│   │   │   └── timeline/page.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── callback/route.ts
│   │   ├── (admin)/
│   │   │   ├── admin/page.tsx
│   │   │   ├── anggota-baru/page.tsx
│   │   │   ├── audit/page.tsx
│   │   │   ├── arsip/page.tsx
│   │   │   └── pengguna/page.tsx
│   │   ├── api/
│   │   │   └── ...
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── layout/
│   │   ├── common/
│   │   ├── members/
│   │   ├── relationships/
│   │   ├── stories/
│   │   └── ui/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── validation/
│   │   ├── permissions/
│   │   └── utils/
│   ├── server/
│   │   ├── actions/
│   │   ├── queries/
│   │   └── services/
│   ├── types/
│   └── features/
│       ├── members/
│       ├── relationships/
│       ├── branches/
│       ├── stories/
│       └── timeline/
├── supabase/
│   ├── migrations/
│   ├── seeds/
│   └── policies/
└── docs/
```

## Structure Philosophy
- keep domain logic grouped by feature
- keep server writes out of random UI files
- isolate Supabase access helpers
- keep validation centralized
- make the codebase easy for Codex and humans to navigate

