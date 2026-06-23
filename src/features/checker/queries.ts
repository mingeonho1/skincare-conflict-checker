import { z } from "zod";
import { db } from "@/lib/db";

type CheckLogPayload = {
  productCount: number;
  detectedActiveIds: string[];
  warnCount: number;
  safeCount: number;
  usedLlm: boolean;
};

export async function logCheck(payload: CheckLogPayload): Promise<void> {
  if (!db) return; // Supabase 미설정 — 로깅 비활성(핵심 기능엔 영향 없음)
  try {
    const { error } = await db.from("skinclash_check_log").insert({
      product_count: payload.productCount,
      detected_active_ids: payload.detectedActiveIds,
      warn_count: payload.warnCount,
      safe_count: payload.safeCount,
      used_llm: payload.usedLlm,
    });

    if (error) {
      // Swallow — logging must never block result delivery
      console.warn("[logCheck] insert failed:", error.message);
    }
  } catch (e) {
    console.warn("[logCheck] unexpected error:", e);
  }
}

export async function logNoRulePairs(pairs: [string, string][]): Promise<void> {
  if (!db) return;
  if (pairs.length === 0) return;
  try {
    const rows = pairs.map(([a, b]) => ({ active_a: a, active_b: b }));
    const { error } = await db.from("skinclash_check_log_pairs").insert(rows);
    if (error) {
      console.warn("[logNoRulePairs] insert failed:", error.message);
    }
  } catch (e) {
    console.warn("[logNoRulePairs] unexpected error:", e);
  }
}

export type TopNoRulePair = {
  active_a: string;
  active_b: string;
  count: number;
};

// Pure transform: group raw DB rows by canonical pair key and sum counts.
// Exported for unit testing without a live DB.
export function aggregateTopPairs(
  rows: { active_a: string; active_b: string }[],
  limit: number,
): TopNoRulePair[] {
  const counts = new Map<
    string,
    { active_a: string; active_b: string; count: number }
  >();
  for (const row of rows) {
    // Normalise order so (a,b) and (b,a) are the same key
    const [keyA, keyB] = [row.active_a, row.active_b].sort();
    const key = `${keyA}|${keyB}`;
    const entry = counts.get(key);
    if (entry) {
      entry.count += 1;
    } else {
      counts.set(key, { active_a: keyA!, active_b: keyB!, count: 1 });
    }
  }
  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Server-only: returns the most frequently seen active↔active unknown pairs —
 * the "next rules to curate" backlog for the flywheel loop.
 * Returns [] on any DB failure so callers never have to handle errors.
 */
export async function getTopNoRulePairs(limit = 20): Promise<TopNoRulePair[]> {
  if (!db) return [];
  try {
    const { data, error } = await db
      .from("skinclash_check_log_pairs")
      .select("active_a, active_b");
    if (error) {
      console.warn("[getTopNoRulePairs] select failed:", error.message);
      return [];
    }
    const rows = z
      .array(z.object({ active_a: z.string(), active_b: z.string() }))
      .safeParse(data);
    if (!rows.success) return [];
    return aggregateTopPairs(rows.data, limit);
  } catch (e) {
    console.warn("[getTopNoRulePairs] unexpected error:", e);
    return [];
  }
}
