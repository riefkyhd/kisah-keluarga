import { z } from "zod";

const optionalShortText = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  },
  z.string().max(120).optional()
);

const optionalLongText = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  },
  z.string().max(2000).optional()
);

const optionalDateText = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  },
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
);

const booleanFromString = z.enum(["true", "false"]).transform((value) => value === "true");

const memberWriteFields = z.object({
  full_name: z.string().trim().min(1, "Nama lengkap wajib diisi.").max(120),
  nickname: optionalShortText,
  gender: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return undefined;
      }

      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    },
    z.enum(["male", "female", "other"]).optional()
  ),
  birth_date: optionalDateText,
  death_date: optionalDateText,
  bio: optionalLongText,
  is_living: booleanFromString
});

function applyMemberDateRules(
  data: { is_living: boolean; birth_date?: string; death_date?: string },
  ctx: z.RefinementCtx
) {
  if (data.is_living && data.death_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["death_date"],
      message: "Tanggal wafat hanya diisi jika anggota sudah wafat."
    });
  }

  if (data.birth_date && data.death_date && data.birth_date > data.death_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["death_date"],
      message: "Tanggal wafat tidak boleh sebelum tanggal lahir."
    });
  }
}

const memberWriteBaseSchema = memberWriteFields.superRefine((data, ctx) => {
  applyMemberDateRules(data, ctx);
});

export const createMemberSchema = memberWriteBaseSchema;

export const updateMemberSchema = memberWriteFields
  .extend({
    person_id: z.string().uuid("ID anggota tidak valid.")
  })
  .superRefine((data, ctx) => {
    applyMemberDateRules(data, ctx);
  });

export const memberArchiveSchema = z.object({
  person_id: z.string().uuid("ID anggota tidak valid.")
});
