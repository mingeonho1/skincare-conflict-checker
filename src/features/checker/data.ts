import { ActiveIngredientSchema, ConflictRuleSchema } from "./schema";
import type { ActiveIngredient, ConflictRule, Selector } from "./schema";
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

/** Returns counts derived purely from static data — no DB, no side effects. */
export function countCurationStats(): {
  activeCount: number;
  ruleCount: number;
} {
  return { activeCount: ACTIVES.length, ruleCount: RULES.length };
}

// Inline selector matching to avoid a circular import with engine-helpers.ts
// (engine-helpers imports ACTIVE_MAP from this module).
function selectorMatchesId(selector: Selector, activeId: string): boolean {
  if ("id" in selector) return selector.id === activeId;
  const active = ACTIVE_MAP.get(activeId);
  return active?.groups.includes(selector.group) ?? false;
}

/**
 * Returns true if the given active id is covered by at least one rule selector,
 * either directly (id selector) or via group membership (group selector).
 * Used by the flywheel script to classify "확장" vs "신규" pairs.
 */
export function participatesInAnyRule(id: string): boolean {
  return RULES.some(
    (rule) =>
      selectorMatchesId(rule.pair[0], id) ||
      selectorMatchesId(rule.pair[1], id),
  );
}
