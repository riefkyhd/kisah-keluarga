# Security and Privacy

## Why This Matters
Family data is sensitive.
Even if this is not a public social product, it still contains:
- names
- family relationships
- birth/death information
- photos
- stories and memories

## Privacy Principles
1. Private by default.
2. Least privilege access.
3. No destructive delete by default.
4. Sensitive writes must be authenticated and audited.

## Access Recommendations
- require login for non-public family data
- only trusted editors can modify relationship data
- media access should follow app access rules
- archived members should not appear in normal browsing

## Data Safety Recommendations
- use soft delete / archive for members and relationships
- keep audit logs for major changes
- validate relationship operations carefully
- protect admin routes and server actions

## Secrets Handling
- keep service role key only on server
- never expose sensitive env vars to client bundles
- use separate environments for local / preview / production

