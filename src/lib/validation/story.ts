import { z } from "zod";

const requiredText = (max: number, emptyMessage: string) =>
  z
    .string()
    .trim()
    .min(1, emptyMessage)
    .max(max, `Maksimum ${max} karakter.`);

const optionalDateText = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  },
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD.")
    .optional()
);

const storyWriteFields = z.object({
  person_id: z.string().uuid("ID anggota tidak valid."),
  title: requiredText(160, "Judul cerita wajib diisi."),
  body: requiredText(3000, "Isi cerita wajib diisi."),
  event_date: optionalDateText
});

export const createStorySchema = storyWriteFields;

export const updateStorySchema = storyWriteFields.extend({
  story_id: z.string().uuid("ID cerita tidak valid.")
});

export const archiveStorySchema = z.object({
  story_id: z.string().uuid("ID cerita tidak valid.")
});
