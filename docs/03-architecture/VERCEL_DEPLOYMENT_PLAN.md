# Vercel Deployment Plan

## Deployment Choice
Deploy the Next.js app to **Vercel**.

## Why It Fits
- native support for Next.js
- very low friction deployment
- good preview deployments
- easy environment variable management
- convenient for iterative development

## Environment Variables (Expected)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `SUPABASE_STORAGE_BUCKET_PROFILE_PHOTOS`
- `SUPABASE_STORAGE_BUCKET_STORY_MEDIA`

## Deployment Rules
- production env vars only in Vercel
- never expose service role key to the browser
- protect admin actions on server
- configure image domains if public URLs are used

## Release Strategy
- main branch -> production
- feature branches -> preview
- use staged rollout by phase, not huge all-at-once release

## Important Hosting Caveat
If the app depends on Supabase free plan, long inactivity can affect project availability behavior.
That should be documented and accepted early.

