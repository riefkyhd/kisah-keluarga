# API and Server Action Plan

## Philosophy
Prefer **server actions / server-side writes** for critical operations.
Do not trust the client for role-sensitive changes.

## Main Write Operations

### Members
- createMember
- updateMember
- archiveMember
- restoreMember
- mergeMembers

### Relationships
- addParentRelationship
- addSpouseRelationship
- addChildRelationship
- removeRelationship

### Media
- uploadProfilePhoto
- replaceProfilePhoto
- removeProfilePhoto

### Stories
- createStory
- updateStory
- publishStory
- archiveStory

### Access / Roles
- assignUserRole
- revokeUserRole

## Main Read Operations
- getMemberDirectory
- getMemberProfile
- getBranchMembers
- getRelatedPeople
- searchMembers
- getStories
- getTimelineItems
- getAuditLogSummary

## Security Rules
- every write checks authenticated user
- every privileged write checks role
- all admin-only actions enforce server-side permission
- audit logging on critical changes

