import { db } from "@/lib/db";

type CheckLogPayload = {
  productCount: number;
  detectedActiveIds: string[];
  warnCount: number;
  safeCount: number;
  usedLlm: boolean;
};

export async function logCheck(payload: CheckLogPayload): Promise<void> {
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
