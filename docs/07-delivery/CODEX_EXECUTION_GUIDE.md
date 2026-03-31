# Codex Execution Guide

## Goal
This file helps Codex implement the project in a structured way without being overwhelmed.

## General Instructions for Codex
- Read the docs in this order:
  1. PROJECT_SUMMARY
  2. PRODUCT_REQUIREMENTS
  3. STACK_DECISION
  4. DATA_MODEL
  5. REPO_STRUCTURE
  6. TASK_BREAKDOWN
- Work in small phases.
- Do not jump to advanced graph/tree features before CRUD is stable.
- Explain affected files before implementing.
- Prefer safe, understandable code over clever abstractions.
- Keep components small and feature-oriented.
- Validate all server-side writes.
- Keep UI mobile-first and elderly-friendly.

## Implementation Rules
- Build one phase at a time.
- After each phase:
  - summarize what changed
  - list affected files
  - explain risks
  - explain how to test
- Use production-minded naming from the beginning.
- Avoid dead code and speculative abstractions.

## Priority Order
1. app foundation
2. auth + roles
3. people CRUD
4. relationships
5. profile photo upload
6. directory search
7. tree view
8. stories / timeline
9. polish
10. deployment hardening

## Important Product Rules
- the app must feel simple for elderly users
- tree view is not the only navigation method
- add/edit/remove member flow must be fluid and local to context
- each member should support profile picture
- delete should default to archive
- family data should feel private and safe

