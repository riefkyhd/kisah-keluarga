# Storage and Media Plan

## Main Requirement
Every family member should be able to have a **profile picture**.
The flow must be simple, fluid, and safe.

## Storage Choice
Use **Supabase Storage**.

## Buckets
### `profile-photos`
Stores member profile pictures.

Suggested path format:
- `people/{personId}/profile/{filename}`

### `story-media`
Stores images tied to stories / memories.

Suggested path format:
- `stories/{storyId}/{filename}`

## Upload Flow
1. User selects image.
2. Client validates size and type.
3. Optional client-side compression / crop.
4. Upload to storage.
5. Save storage path to database.
6. Refresh profile card.

## Allowed Formats
- jpg
- jpeg
- png
- webp

## Recommended Constraints
- reject extremely large images
- normalize or compress profile photos when possible
- store original path and maybe transformed display URL if needed later

## UX Requirements
- preview before save
- show upload progress
- clear replace-photo action
- allow remove-photo action
- graceful failure message

## Privacy Note
If the product is private family-only, media access rules should reflect that.
Avoid accidental exposure of sensitive family photos.

