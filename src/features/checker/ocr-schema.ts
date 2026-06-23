import { z } from "zod";

const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"] as const;

export const OcrInputSchema = z.object({
  mimeType: z.enum(ALLOWED),
  base64Data: z
    .string()
    .min(1)
    .refine(
      (s) => Math.floor((s.length * 3) / 4) <= MAX_IMAGE_BYTES,
      "이미지가 너무 커요 (6MB 이하)",
    ),
});
