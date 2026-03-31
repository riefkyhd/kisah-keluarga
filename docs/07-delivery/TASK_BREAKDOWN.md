# Task Breakdown

## Delivery Strategy
Implement in phases, from highest product value and lowest complexity first.
Do not start with tree visualization or fancy interaction first.

## Recommended Build Order
1. Foundation
2. Auth and roles
3. Family members CRUD
4. Relationships
5. Profile photos
6. Search and directory
7. Tree view
8. Stories and timeline
9. Elderly-friendly polish
10. PWA and deployment hardening

## Phase 0 — Foundation
- initialize Next.js app
- setup Tailwind and shadcn/ui
- setup Supabase project
- connect app to Supabase
- establish folder structure
- define environment variables
- create database migration baseline
- create app shell layout

## Phase 1 — Auth and Roles
- implement login flow
- create role table and role guard helpers
- implement protected routes
- seed initial admin

## Phase 2 — Family Members CRUD
- create people table
- build family directory page
- build member profile page
- build create/edit member form
- implement archive / restore member flow

## Phase 3 — Relationships
- create relationships table
- add parent / spouse / child actions
- show related people sections on profile page
- validate duplicate or illegal relationships
- compute siblings from shared parents

## Phase 4 — Profile Photos and Media
- create storage buckets
- implement upload / replace / remove photo flow
- show photo preview and progress
- save metadata to database

## Phase 5 — Search and Discovery
- implement member search
- add filters by branch
- optimize mobile directory browsing

## Phase 6 — Tree View
- design simple relationship visualization
- focus on one person at a time
- implement pan/zoom basic
- keep fallback list-based relation view always available

## Phase 7 — Stories and Timeline
- create stories table
- build story list and story detail pages
- link stories to people
- build simple timeline view

## Phase 8 — Elderly-Friendly Polish
- enlarge tap targets
- improve contrast and spacing
- simplify labels and empty states
- add optional display preferences if needed

## Phase 9 — PWA and Installability
- manifest
- app icons
- install prompt strategy
- offline fallback basics (optional)

## Phase 10 — Deployment and Hardening
- production env setup in Vercel
- storage rules and RLS review
- security review
- smoke tests
- launch checklist

