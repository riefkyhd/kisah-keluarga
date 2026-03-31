# Content Moderation and Audit

## Why Moderation Exists
Even family apps need moderation because:
- data can be wrong
- duplicate profiles can be created
- relationship edits can be sensitive
- stories can accidentally contain private information

## Audit Scope
Audit logs should track:
- member creation
- member edit
- relationship creation/removal
- member archival/restoration
- profile photo replacement
- role changes

## Suggested Audit Format
Each log entry should include:
- actor
- action
- target entity
- short summary
- timestamp
- before snapshot (where applicable)
- after snapshot (where applicable)

## Moderation Workflow (Optional for MVP, Strong for Phase 2)
- contributors submit suggested changes
- editors/admins review and approve
- approved changes become live

