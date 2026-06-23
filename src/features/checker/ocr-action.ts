"use server";

import { ZodError } from "zod";
import { OcrInputSchema } from "./ocr-schema";
import { extractTextFromImage } from "@/lib/gemini";

export async function runOcr(
  rawInput: unknown,
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  let parsed: { mimeType: string; base64Data: string };
  try {
    parsed = OcrInputSchema.parse(rawInput);
  } catch (e) {
    if (e instanceof ZodError)
      return {
        ok: false,
        error: "jpg/png/webp 이미지를 6MB 이하로 올려주세요.",
      };
    return { ok: false, error: "이미지 처리 중 오류가 발생했어요." };
  }

  const result = await extractTextFromImage(parsed.base64Data, parsed.mimeType);
  if (!result.ok) {
    if (result.reason === "no-key")
      return {
        ok: false,
        error: "사진 인식이 지원되지 않아요. 전성분을 직접 붙여넣어 주세요.",
      };
    return {
      ok: false,
      error: "사진 인식이 안 돼요. 전성분을 직접 붙여넣어 주세요.",
    };
  }
  return { ok: true, text: result.text };
}
