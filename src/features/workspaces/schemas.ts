import { z } from "zod";

const MAX_IMAGE_SIZE = 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/jpg",
] as const;

const imageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_IMAGE_SIZE, "Image must be 1MB or smaller")
  .refine(
    (file) => ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number]),
    "Only JPG, JPEG, PNG, or SVG files are allowed"
  );

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  image: z.union([
    imageFileSchema,
    z.string().transform((value) => value === "" ? undefined : value),
  ])
  .optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Must be 1 or more characters").optional(),
  image: z.union([
    imageFileSchema,
    z.string().transform((value) => value === "" ? undefined : value),
  ])
  .optional(),
});
