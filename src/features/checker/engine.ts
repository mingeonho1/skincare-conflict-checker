import { RULES, ACTIVE_MAP } from "./data";
import type { WarningItem, SafeNoteItem } from "./schema";

type ProductActives = {
  productIndex: number;
  activeIds: string[];
};

type JudgeResult = {
  warnings: WarningItem[];
  safeNotes: SafeNoteItem[];
  duplicateActives: { activeId: string; productIndices: number[] }[];
};

function collectAllActiveIds(productActives: ProductActives[]): Set<string> {
  const ids = new Set<string>();
  for (const product of productActives) {
    for (const id of product.activeIds) {
      ids.add(id);
    }
  }
  return ids;
}

function buildConflictLists(allActiveIds: Set<string>): {
  warnings: WarningItem[];
  safeNotes: SafeNoteItem[];
} {
  const warnings: WarningItem[] = [];
  const safeNotes: SafeNoteItem[] = [];

  for (const rule of RULES) {
    const [idA, idB] = rule.pair;
    if (!allActiveIds.has(idA) || !allActiveIds.has(idB)) continue;

    const activeA = ACTIVE_MAP.get(idA);
    const activeB = ACTIVE_MAP.get(idB);
    if (!activeA || !activeB) continue;

    if (rule.verdict === "warn" && rule.severity !== null) {
      warnings.push({
        ruleId: rule.id,
        activeIds: [idA, idB],
        displayNames: [activeA.displayName, activeB.displayName],
        severity: rule.severity,
        mechanism: rule.mechanism,
        action: rule.action,
      });
    } else if (rule.verdict === "safe") {
      safeNotes.push({
        ruleId: rule.id,
        activeIds: [idA, idB],
        displayNames: [activeA.displayName, activeB.displayName],
        mechanism: rule.mechanism,
      });
    }
  }

  // high severity first
  warnings.sort((a, b) => {
    if (a.severity === b.severity) return 0;
    return a.severity === "high" ? -1 : 1;
  });

  return { warnings, safeNotes };
}

function findDuplicateActives(
  productActives: ProductActives[],
): { activeId: string; productIndices: number[] }[] {
  const activeToProductIndices = new Map<string, number[]>();

  for (const product of productActives) {
    for (const activeId of product.activeIds) {
      const existing = activeToProductIndices.get(activeId) ?? [];
      if (!existing.includes(product.productIndex)) {
        existing.push(product.productIndex);
      }
      activeToProductIndices.set(activeId, existing);
    }
  }

  return Array.from(activeToProductIndices.entries())
    .filter(([activeId, indices]) => {
      if (indices.length < 2) return false;
      // Humectants (e.g. hyaluronic acid) are safe viscosity helpers — duplication is harmless
      return ACTIVE_MAP.get(activeId)?.category !== "humectant";
    })
    .map(([activeId, productIndices]) => ({ activeId, productIndices }));
}

export function judge(productActives: ProductActives[]): JudgeResult {
  const allActiveIds = collectAllActiveIds(productActives);
  const { warnings, safeNotes } = buildConflictLists(allActiveIds);
  const duplicateActives = findDuplicateActives(productActives);
  return { warnings, safeNotes, duplicateActives };
}
