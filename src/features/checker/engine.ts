import { RULES, ACTIVE_MAP } from "./data";
import type { WarningItem, SafeNoteItem } from "./schema";
import {
  resolveResolution,
  isStrongActive,
  selectorMatches,
  selectorSpecificity,
} from "./engine-helpers";

const SEVERITY_ORDER = { high: 0, moderate: 1, low: 2 };

type ProductActives = { productIndex: number; activeIds: string[] };

type ConflictLists = {
  warnings: WarningItem[];
  cautions: WarningItem[];
  safeNotes: SafeNoteItem[];
  alternateDaySuggestions: { aDisplay: string; bDisplay: string }[];
  noRulePairs: [string, string][];
};

type JudgeResult = ConflictLists & {
  duplicateActives: { activeId: string; productIndices: number[] }[];
  barrierTip: { recommend: boolean; missingSupport: boolean };
};

function collectAllActiveIds(productActives: ProductActives[]): Set<string> {
  const ids = new Set<string>();
  for (const p of productActives) for (const id of p.activeIds) ids.add(id);
  return ids;
}

function pickBestRule(matchingRules: typeof RULES) {
  return matchingRules.reduce((best, rule) => {
    const spec = (r: (typeof RULES)[0]) =>
      selectorSpecificity(r.pair[0]) + selectorSpecificity(r.pair[1]);
    return spec(rule) > spec(best) ? rule : best;
  });
}

function rulesForPair(idA: string, idB: string) {
  return RULES.filter((rule) => {
    const [selA, selB] = rule.pair;
    return (
      (selectorMatches(selA, idA) && selectorMatches(selB, idB)) ||
      (selectorMatches(selA, idB) && selectorMatches(selB, idA))
    );
  });
}

type RuleBase = {
  ruleId: string;
  activeIds: [string, string];
  displayNames: [string, string];
};

function makeBase(
  rule: (typeof RULES)[0],
  activeIds: [string, string],
  displayNames: [string, string],
): RuleBase {
  return { ruleId: rule.id, activeIds, displayNames };
}

function pushWarningItem(
  rule: (typeof RULES)[0],
  base: RuleBase,
  lists: ConflictLists,
) {
  const severity = rule.severity ?? "low";
  const resolution = resolveResolution(rule.mechanismType, severity);
  const item: WarningItem = {
    ...base,
    verdict: rule.verdict as "warn" | "caution",
    severity,
    confidence: rule.confidence,
    mechanismType: rule.mechanismType,
    mechanism: rule.mechanism,
    action: rule.action,
    source: rule.source,
    resolution,
  };
  if (rule.verdict === "warn") lists.warnings.push(item);
  else lists.cautions.push(item);
  const isAlternateDay =
    rule.mechanismType === "irritation" ||
    (rule.mechanismType === "inactivation" && severity === "high");
  if (isAlternateDay)
    lists.alternateDaySuggestions.push({
      aDisplay: base.displayNames[0],
      bDisplay: base.displayNames[1],
    });
}

// Ingredients that are always safe regardless of context — logging their pairs
// as "아직 모름" would pollute both the UI disclosure and the flywheel data.
// Criteria: SUPPORT-group ingredients + sunscreen (never a conflict anchor).
function isSupportAnchor(id: string): boolean {
  const active = ACTIVE_MAP.get(id);
  if (!active) return false;
  return (
    active.groups.includes("SUPPORT") ||
    active.category === "humectant" ||
    active.category === "soothing" ||
    active.category === "sunscreen"
  );
}

function applyPairToLists(idA: string, idB: string, lists: ConflictLists) {
  const matching = rulesForPair(idA, idB);
  if (matching.length === 0) {
    // Only log genuine active↔active unknown pairs — not support-ingredient pairs
    if (!isSupportAnchor(idA) && !isSupportAnchor(idB)) {
      lists.noRulePairs.push([idA, idB]);
    }
    return;
  }
  const rule = pickBestRule(matching);
  const activeA = ACTIVE_MAP.get(idA);
  const activeB = ACTIVE_MAP.get(idB);
  if (!activeA || !activeB) return;

  const activeIds: [string, string] = [idA, idB];
  const displayNames: [string, string] = [
    activeA.displayName,
    activeB.displayName,
  ];
  const base = makeBase(rule, activeIds, displayNames);

  if (rule.verdict === "safe") {
    lists.safeNotes.push({
      ...base,
      confidence: rule.confidence,
      mechanismType: rule.mechanismType,
      mechanism: rule.mechanism,
      action: rule.action,
      source: rule.source,
      ...(rule.myth !== undefined ? { myth: rule.myth } : {}),
    });
    return;
  }
  pushWarningItem(rule, base, lists);
}

function buildConflictLists(allActiveIds: Set<string>): ConflictLists {
  const lists: ConflictLists = {
    warnings: [],
    cautions: [],
    safeNotes: [],
    alternateDaySuggestions: [],
    noRulePairs: [],
  };
  const ids = Array.from(allActiveIds);
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      applyPairToLists(ids[i]!, ids[j]!, lists);
    }
  }
  const bySev = (a: WarningItem, b: WarningItem) =>
    SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
  lists.warnings.sort(bySev);
  lists.cautions.sort(bySev);
  return lists;
}

function isNotDuplicable(activeId: string): boolean {
  const active = ACTIVE_MAP.get(activeId);
  return (
    active?.category === "humectant" ||
    (active?.groups.includes("SUPPORT") ?? false)
  );
}

function findDuplicateActives(productActives: ProductActives[]) {
  const map = new Map<string, number[]>();
  for (const p of productActives) {
    for (const id of p.activeIds) {
      const arr = map.get(id) ?? [];
      if (!arr.includes(p.productIndex)) arr.push(p.productIndex);
      map.set(id, arr);
    }
  }
  return Array.from(map.entries())
    .filter(([id, indices]) => indices.length >= 2 && !isNotDuplicable(id))
    .map(([activeId, productIndices]) => ({ activeId, productIndices }));
}

function computeBarrierTip(allActiveIds: Set<string>) {
  const ids = Array.from(allActiveIds);
  if (!ids.some(isStrongActive))
    return { recommend: false, missingSupport: false };
  const hasSupport = ids.some(
    (id) => ACTIVE_MAP.get(id)?.groups.includes("SUPPORT") ?? false,
  );
  return { recommend: !hasSupport, missingSupport: !hasSupport };
}

export function judge(productActives: ProductActives[]): JudgeResult {
  const allActiveIds = collectAllActiveIds(productActives);
  const {
    warnings,
    cautions,
    safeNotes,
    alternateDaySuggestions,
    noRulePairs,
  } = buildConflictLists(allActiveIds);
  return {
    warnings,
    cautions,
    safeNotes,
    alternateDaySuggestions,
    noRulePairs,
    duplicateActives: findDuplicateActives(productActives),
    barrierTip: computeBarrierTip(allActiveIds),
  };
}
