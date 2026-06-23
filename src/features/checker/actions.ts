"use server";

import { ZodError } from "zod";
import { CheckInputSchema } from "./schema";
import type { CheckResult, WarningItem, SafeNoteItem } from "./schema";
import { extractByKeyword } from "./extract";
import { extractWithLlm, narrate } from "@/lib/gemini";
import { judge } from "./engine";
import { buildRoutine } from "./routine";
import { logCheck, logNoRulePairs } from "./queries";

type IncludedProduct = {
  originalIndex: number;
  name?: string;
  ingredients: string;
};

type ParsedProduct = { name?: string; ingredients: string };

function partitionProducts(products: ParsedProduct[]): {
  included: IncludedProduct[];
  excludedIndices: number[];
} {
  const included: IncludedProduct[] = [];
  const excludedIndices: number[] = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    if (!product) continue;
    if (product.ingredients.trim().length < 3) {
      excludedIndices.push(i);
    } else {
      included.push({
        originalIndex: i,
        name: product.name,
        ingredients: product.ingredients,
      });
    }
  }

  return { included, excludedIndices };
}

function emptyResult(excludedProducts: number[]): CheckResult {
  return {
    warnings: [],
    cautions: [],
    safeNotes: [],
    amSteps: [],
    pmSteps: [],
    excludedProducts,
    duplicateActives: [],
    needsSunscreen: false,
    usedLlm: false,
    detectedActiveIds: [],
    barrierTip: { recommend: false, missingSupport: false },
    alternateDaySuggestions: [],
    noRulePairs: [],
  };
}

async function extractActives(included: IncludedProduct[]) {
  const llmResult = await extractWithLlm(included.map((p) => p.ingredients));

  return {
    productActives: included.map((p, i) => ({
      productIndex: p.originalIndex,
      activeIds: Array.from(
        new Set([
          ...extractByKeyword(p.ingredients),
          ...(llmResult.perProduct[i] ?? []),
        ]),
      ),
    })),
    llmUsed: llmResult.usedLlm,
  };
}

async function applyNarration(
  warnings: WarningItem[],
  cautions: WarningItem[],
  safeNotes: SafeNoteItem[],
) {
  const allConflicts = [...warnings, ...cautions];
  const narrationMap = await narrate(allConflicts, safeNotes);

  function applyNarrationToItems(items: WarningItem[]): WarningItem[] {
    return items.map((w) => {
      const narration = narrationMap.get(w.ruleId);
      if (!narration) return w;
      return {
        ...w,
        mechanism: narration.narratedMechanism,
        action: narration.narratedAction,
      };
    });
  }

  return {
    narratedWarnings: applyNarrationToItems(warnings),
    narratedCautions: applyNarrationToItems(cautions),
    narrationUsed: narrationMap.size > 0,
  };
}

async function analyzeProducts(
  included: IncludedProduct[],
): Promise<Omit<CheckResult, "excludedProducts">> {
  const { productActives, llmUsed } = await extractActives(included);
  const {
    warnings,
    cautions,
    safeNotes,
    duplicateActives,
    barrierTip,
    alternateDaySuggestions,
    noRulePairs,
  } = judge(productActives);

  // Fire-and-forget flywheel logging — swallow all failures
  logNoRulePairs(noRulePairs).catch(() => undefined);
  const { narratedWarnings, narratedCautions, narrationUsed } =
    await applyNarration(warnings, cautions, safeNotes);

  const allActiveIds = Array.from(
    new Set(productActives.flatMap((p) => p.activeIds)),
  );
  const allNarratedConflicts = [...narratedWarnings, ...narratedCautions];
  const { amSteps, pmSteps, needsSunscreen } = buildRoutine(
    allActiveIds,
    allNarratedConflicts,
  );

  return {
    warnings: narratedWarnings,
    cautions: narratedCautions,
    safeNotes,
    amSteps,
    pmSteps,
    duplicateActives,
    needsSunscreen,
    usedLlm: llmUsed || narrationUsed,
    detectedActiveIds: allActiveIds,
    barrierTip,
    alternateDaySuggestions,
    noRulePairs,
  };
}

export async function runCheck(
  rawInput: unknown,
): Promise<{ ok: true; result: CheckResult } | { ok: false; error: string }> {
  let parsed: ReturnType<typeof CheckInputSchema.parse>;
  try {
    parsed = CheckInputSchema.parse(rawInput);
  } catch (e) {
    if (e instanceof ZodError)
      return { ok: false, error: "입력 형식이 올바르지 않아요." };
    return {
      ok: false,
      error: "알 수 없는 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
    };
  }

  const { included, excludedIndices } = partitionProducts(parsed.products);

  if (included.length === 0) {
    return { ok: true, result: emptyResult(excludedIndices) };
  }

  const partial = await analyzeProducts(included);
  const result: CheckResult = { ...partial, excludedProducts: excludedIndices };

  try {
    await logCheck({
      productCount: included.length,
      detectedActiveIds: result.detectedActiveIds,
      warnCount: result.warnings.length + result.cautions.length,
      safeCount: result.safeNotes.length,
      usedLlm: result.usedLlm,
    });
  } catch {
    // Intentionally swallowed
  }

  return { ok: true, result };
}
