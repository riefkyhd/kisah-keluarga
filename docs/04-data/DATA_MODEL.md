# Data Model

## Core Modeling Principle
Model the family as:
- **persons**
- **relationships (edges)**
- **media**
- **stories / memories**
- **branches**

Do **not** model it as a rigid single tree only.
Families can be more complex than a strict tree:
- remarriage
- adoption
- guardianship
- incomplete data
- duplicate submissions

## Main Entities

### Person
Represents one family member.

Fields (conceptual):
- id
- full_name
- nickname
- gender
- birth_date
- death_date
- birth_place
- bio
- family_branch_id
- profile_photo_path
- is_living
- is_archived
- created_at
- updated_at
- created_by
- updated_by

### Relationship
Represents a directed relationship edge.

Fields:
- id
- from_person_id
- to_person_id
- relationship_type
- is_primary
- start_date
- end_date
- notes
- is_archived
- created_at
- updated_at

Supported types for MVP:
- parent
- spouse

Can expand later:
- adopted_parent
- guardian
- former_spouse

### FamilyBranch
Represents major family line / lineage / grouping.

Fields:
- id
- name
- slug
- description
- ancestor_person_id (optional)

### MediaAsset
Represents uploaded media.

Fields:
- id
- owner_person_id (nullable)
- storage_bucket
- storage_path
- media_type
- caption
- uploaded_by
- created_at

### Story
Represents a memory, note, or story.

Fields:
- id
- title
- body
- author_user_id
- status
- created_at
- updated_at

### StoryPersonLink
Links stories to people.

Fields:
- story_id
- person_id

### UserRole
Maps user account to app role.

Fields:
- id
- user_id
- role
- created_at

### AuditLog
Tracks important changes.

Fields:
- id
- actor_user_id
- action_type
- entity_type
- entity_id
- summary
- before_json
- after_json
- created_at

## Derived Data
The following should usually be **derived**, not stored as primary truth:
- siblings
- grandparents
- grandchildren
- cousins

