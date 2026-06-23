import { z } from "zod";

export const ActiveIngredientSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  aliases: z.array(z.string()),
  category: z.string(),
  photosensitive: z.boolean(),
  timeOfDay: z.enum(["AM", "PM", "ANY"]),
  viscosityRank: z.number(),
});

export const ConflictRuleSchema = z.object({
  id: z.string(),
  pair: z.tuple([z.string(), z.string()]),
  verdict: z.enum(["warn", "safe"]),
  severity: z.enum(["high", "moderate"]).nullable(),
  mechanism: z.string(),
  action: z.string(),
});

export const StepSchema = z.object({
  activeId: z.string(),
  displayName: z.string(),
  viscosityRank: z.number(),
});

export const CheckInputSchema = z.object({
  products: z
    .array(
      z.object({
        name: z.string().optional(),
        // 4000자 초과 시 거부 대신 트림 — 긴 전성분도 처리되도록 (PLAN 엣지 #9)
        ingredients: z
          .string()
          .trim()
          .transform((s) => s.slice(0, 4000)),
      }),
    )
    .min(1)
    .max(6),
});

export type ActiveIngredient = z.infer<typeof ActiveIngredientSchema>;
export type ConflictRule = z.infer<typeof ConflictRuleSchema>;
export type Step = z.infer<typeof StepSchema>;
export type CheckInput = z.infer<typeof CheckInputSchema>;

export type WarningItem = {
  ruleId: string;
  activeIds: [string, string];
  displayNames: [string, string];
  severity: "high" | "moderate";
  mechanism: string;
  action: string;
};

export type SafeNoteItem = {
  ruleId: string;
  activeIds: [string, string];
  displayNames: [string, string];
  mechanism: string;
};

export const CheckResultSchema = z.object({
  warnings: z.array(
    z.object({
      ruleId: z.string(),
      activeIds: z.tuple([z.string(), z.string()]),
      displayNames: z.tuple([z.string(), z.string()]),
      severity: z.enum(["high", "moderate"]),
      mechanism: z.string(),
      action: z.string(),
    }),
  ),
  safeNotes: z.array(
    z.object({
      ruleId: z.string(),
      activeIds: z.tuple([z.string(), z.string()]),
      displayNames: z.tuple([z.string(), z.string()]),
      mechanism: z.string(),
    }),
  ),
  amSteps: z.array(StepSchema),
  pmSteps: z.array(StepSchema),
  excludedProducts: z.array(z.number()),
  duplicateActives: z.array(
    z.object({
      activeId: z.string(),
      productIndices: z.array(z.number()),
    }),
  ),
  needsSunscreen: z.boolean(),
  usedLlm: z.boolean(),
  detectedActiveIds: z.array(z.string()),
});

export type CheckResult = z.infer<typeof CheckResultSchema>;
