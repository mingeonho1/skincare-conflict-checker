import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { env } from "@/lib/env";
import { ACTIVE_MAP } from "@/features/checker/data";
import type { WarningItem, SafeNoteItem } from "@/features/checker/schema";

// Gemini 3.1 Flash-Lite (GA 2026-05-07) — 저지연·저비용. 충돌 '판정'은 규칙 엔진이
// 담당하고, 이 모델은 (a)전성분에서 액티브 추출 (b)경고 카피 윤문에만 쓴다.
const MODEL = "gemini-3.1-flash-lite";

export type LlmExtractionResult = {
  perProduct: string[][];
  usedLlm: boolean;
};

export type LlmNarrationResult = {
  narratedMechanism: string;
  narratedAction: string;
} | null;

const VALID_ACTIVE_IDS = Array.from(ACTIVE_MAP.keys());

const NarrationSchema = z.array(
  z.object({
    ruleId: z.string(),
    narratedMechanism: z.string(),
    narratedAction: z.string(),
  }),
);

function extractJsonArray(text: string): string | null {
  const match = text.match(/\[[\s\S]*\]/);
  return match ? (match[0] ?? null) : null;
}

function getClient() {
  return new GoogleGenAI({ apiKey: env.GEMINI_API_KEY! });
}

async function generateText(prompt: string, ms: number): Promise<string> {
  const response = await withTimeout(
    getClient().models.generateContent({ model: MODEL, contents: prompt }),
    ms,
  );
  return (response.text ?? "").trim();
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), ms),
  );
  return Promise.race([promise, timeout]);
}

function emptyPerProduct(productIngredients: string[]): LlmExtractionResult {
  return { perProduct: productIngredients.map(() => []), usedLlm: false };
}

export async function extractWithLlm(
  productIngredients: string[],
): Promise<LlmExtractionResult> {
  if (!env.GEMINI_API_KEY) return emptyPerProduct(productIngredients);

  try {
    const numberedList = productIngredients
      .map((ing, i) => `Product ${i + 1}:\n${ing}`)
      .join("\n\n");

    const prompt = `You are a skincare ingredient analyzer. Given the following ingredient lists (one per product), identify which of these specific active ingredient IDs are present in EACH product.

Valid active IDs: ${VALID_ACTIVE_IDS.join(", ")}

${numberedList}

Return ONLY a JSON array where each element is an array of matching active IDs for that product (in the same order as the products above).
Example for 2 products: [["retinol", "niacinamide"], ["vitamin-c", "niacinamide"]]
If a product has no matches, use an empty array: []`;

    const jsonRaw = extractJsonArray(await generateText(prompt, 8000));
    if (!jsonRaw) return emptyPerProduct(productIngredients);

    const parsed = z.array(z.array(z.string())).parse(JSON.parse(jsonRaw));

    if (parsed.length !== productIngredients.length) {
      return emptyPerProduct(productIngredients);
    }

    const perProduct = parsed.map((ids) =>
      ids.filter((id) => ACTIVE_MAP.has(id)),
    );
    return { perProduct, usedLlm: true };
  } catch {
    return emptyPerProduct(productIngredients);
  }
}

function buildNarrationPrompt(warnings: WarningItem[]): string {
  const descriptions = warnings
    .map(
      (w, i) =>
        `${i + 1}. ruleId: "${w.ruleId}", 성분: ${w.displayNames.join(" + ")}, 기존 설명: "${w.mechanism}"`,
    )
    .join("\n");

  return `다음 스킨케어 성분 충돌 경고들을 더 자연스럽고 친근한 한국어로 재서술해주세요.

${descriptions}

각 경고에 대해 JSON 배열로 응답해주세요:
[
  { "ruleId": "...", "narratedMechanism": "...", "narratedAction": "..." }
]

각 항목의 narratedMechanism은 100자 이내, narratedAction은 80자 이내로 작성하세요.`;
}

function parseNarrationResponse(text: string): Map<string, LlmNarrationResult> {
  const jsonRaw = extractJsonArray(text);
  if (!jsonRaw) return new Map();

  const parsed = NarrationSchema.parse(JSON.parse(jsonRaw));
  const resultMap = new Map<string, LlmNarrationResult>();
  for (const item of parsed) {
    resultMap.set(item.ruleId, {
      narratedMechanism: item.narratedMechanism,
      narratedAction: item.narratedAction,
    });
  }
  return resultMap;
}

export async function narrate(
  warnings: WarningItem[],
  _safeNotes: SafeNoteItem[],
): Promise<Map<string, LlmNarrationResult>> {
  if (!env.GEMINI_API_KEY) return new Map();

  const topWarnings = warnings.slice(0, 3);
  if (topWarnings.length === 0) return new Map();

  try {
    return parseNarrationResponse(
      await generateText(buildNarrationPrompt(topWarnings), 8000),
    );
  } catch {
    return new Map();
  }
}
