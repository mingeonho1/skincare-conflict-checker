import { z } from "zod";

export const ActiveIngredientSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  aliases: z.array(z.string()),
  category: z.string(),
  photosensitive: z.boolean(),
  timeOfDay: z.enum(["AM", "PM", "ANY"]),
  viscosityRank: z.number(),
  groups: z.array(z.string()),
  note: z.string().optional(),
});

const SelectorSchema = z.union([
  z.object({ id: z.string() }),
  z.object({ group: z.string() }),
]);

export const ConflictRuleSchema = z.object({
  id: z.string(),
  pair: z.tuple([SelectorSchema, SelectorSchema]),
  verdict: z.enum(["warn", "caution", "safe"]),
  severity: z.enum(["high", "moderate", "low"]).nullable(),
  confidence: z.enum(["established", "contested", "myth"]),
  mechanismType: z.enum([
    "irritation",
    "oxidation",
    "inactivation",
    "ph",
    "photosensitivity",
    "synergy",
    "drying",
  ]),
  mechanism: z.string(),
  action: z.string(),
  source: z.object({
    label: z.string(),
    url: z.string(),
  }),
  myth: z.string().optional(),
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
export type Selector = z.infer<typeof SelectorSchema>;
export type ConflictRule = z.infer<typeof ConflictRuleSchema>;
export type Step = z.infer<typeof StepSchema>;

export type WarningItem = {
  ruleId: string;
  activeIds: [string, string];
  displayNames: [string, string];
  verdict: "warn" | "caution";
  severity: "high" | "moderate" | "low";
  confidence: "established" | "contested" | "myth";
  mechanismType: ConflictRule["mechanismType"];
  mechanism: string;
  action: string;
  source: { label: string; url: string };
  resolution: "separate-am-pm" | "alternate-days" | "buffer-wait";
};

export type SafeNoteItem = {
  ruleId: string;
  activeIds: [string, string];
  displayNames: [string, string];
  confidence: "established" | "contested" | "myth";
  mechanismType: ConflictRule["mechanismType"];
  mechanism: string;
  action: string;
  source: { label: string; url: string };
  myth?: string;
};

const MECHANISM_TYPE_ENUM = z.enum([
  "irritation",
  "oxidation",
  "inactivation",
  "ph",
  "photosensitivity",
  "synergy",
  "drying",
]);

const RESOLUTION_ENUM = z.enum([
  "separate-am-pm",
  "alternate-days",
  "buffer-wait",
]);

export const CheckResultSchema = z.object({
  warnings: z.array(
    z.object({
      ruleId: z.string(),
      activeIds: z.tuple([z.string(), z.string()]),
      displayNames: z.tuple([z.string(), z.string()]),
      verdict: z.enum(["warn", "caution"]),
      severity: z.enum(["high", "moderate", "low"]),
      confidence: z.enum(["established", "contested", "myth"]),
      mechanismType: MECHANISM_TYPE_ENUM,
      mechanism: z.string(),
      action: z.string(),
      source: z.object({ label: z.string(), url: z.string() }),
      resolution: RESOLUTION_ENUM,
    }),
  ),
  cautions: z.array(
    z.object({
      ruleId: z.string(),
      activeIds: z.tuple([z.string(), z.string()]),
      displayNames: z.tuple([z.string(), z.string()]),
      verdict: z.enum(["warn", "caution"]),
      severity: z.enum(["high", "moderate", "low"]),
      confidence: z.enum(["established", "contested", "myth"]),
      mechanismType: MECHANISM_TYPE_ENUM,
      mechanism: z.string(),
      action: z.string(),
      source: z.object({ label: z.string(), url: z.string() }),
      resolution: RESOLUTION_ENUM,
    }),
  ),
  safeNotes: z.array(
    z.object({
      ruleId: z.string(),
      activeIds: z.tuple([z.string(), z.string()]),
      displayNames: z.tuple([z.string(), z.string()]),
      confidence: z.enum(["established", "contested", "myth"]),
      mechanismType: MECHANISM_TYPE_ENUM,
      mechanism: z.string(),
      action: z.string(),
      source: z.object({ label: z.string(), url: z.string() }),
      myth: z.string().optional(),
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
  barrierTip: z.object({
    recommend: z.boolean(),
    missingSupport: z.boolean(),
  }),
  alternateDaySuggestions: z.array(
    z.object({
      aDisplay: z.string(),
      bDisplay: z.string(),
    }),
  ),
  noRulePairs: z.array(z.tuple([z.string(), z.string()])),
});

export type CheckResult = z.infer<typeof CheckResultSchema>;
