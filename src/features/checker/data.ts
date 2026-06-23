import { ActiveIngredientSchema, ConflictRuleSchema } from "./schema";
import type { ActiveIngredient, ConflictRule } from "./schema";
import { ACTIVES_RAW } from "./actives-data";
import { RULES_RAW } from "./rules-data";

// Validate at module load — schema mismatches are coding errors, not runtime user errors
export const ACTIVES: ActiveIngredient[] =
  ActiveIngredientSchema.array().parse(ACTIVES_RAW);
export const RULES: ConflictRule[] =
  ConflictRuleSchema.array().parse(RULES_RAW);

export const ACTIVE_MAP: Map<string, ActiveIngredient> = new Map(
  ACTIVES.map((a) => [a.id, a]),
);
export const RULE_MAP: Map<string, ConflictRule> = new Map(
  RULES.map((r) => [r.id, r]),
);
