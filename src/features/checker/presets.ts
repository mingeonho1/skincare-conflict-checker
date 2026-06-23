import { z } from "zod";
import { PRESETS_RAW } from "./presets-data";

export const PresetSchema = z.object({
  id: z.string(),
  label: z.string(),
  ingredients: z.string().min(30),
});

export const PRESETS = PresetSchema.array().parse(
  PRESETS_RAW.map((p) => ({ ...p })),
);

export type Preset = z.infer<typeof PresetSchema>;
