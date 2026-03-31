import { z } from "zod";

export const RELATIONSHIP_TYPES = ["parent", "spouse"] as const;
export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

const relationshipWriteSchema = z
  .object({
    person_id: z.string().uuid("ID anggota tidak valid."),
    related_person_id: z.string().uuid("ID anggota terkait tidak valid.")
  })
  .refine((data) => data.person_id !== data.related_person_id, {
    path: ["related_person_id"],
    message: "Anggota tidak bisa dihubungkan ke dirinya sendiri."
  });

export const addParentRelationshipSchema = relationshipWriteSchema;
export const addChildRelationshipSchema = relationshipWriteSchema;
export const addSpouseRelationshipSchema = relationshipWriteSchema;

export const archiveRelationshipSchema = z.object({
  relationship_id: z.string().uuid("ID relasi tidak valid."),
  person_id: z.string().uuid("ID anggota tidak valid.")
});
