"use client";

import { useState } from "react";
import { runOcr } from "@/features/checker/ocr-action";

type OcrState =
  | { status: "idle" }
  | { status: "reading" }
  | { status: "done" }
  | { status: "error"; message: string };

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 6 * 1024 * 1024;

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result;
      if (typeof dataUrl !== "string") {
        reject(new Error("FileReader result is not a string"));
        return;
      }
      const base64 = dataUrl.split(",")[1];
      if (!base64) {
        reject(new Error("사진을 읽지 못했어요. 다시 시도해 주세요."));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () =>
      reject(new Error("사진을 읽지 못했어요. 다시 시도해 주세요."));
    reader.readAsDataURL(file);
  });
}

type SetOcrState = (state: OcrState) => void;

function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type))
    return "jpg, png, webp 이미지만 올릴 수 있어요.";
  if (file.size > MAX_BYTES) return "이미지가 너무 커요 (6MB 이하).";
  return null;
}

async function processOcrFile(
  file: File,
  setState: SetOcrState,
  onText: (text: string) => void,
) {
  const validationError = validateImageFile(file);
  if (validationError) {
    setState({ status: "error", message: validationError });
    return;
  }
  setState({ status: "reading" });
  try {
    const base64Data = await readFileAsBase64(file);
    const result = await runOcr({ mimeType: file.type, base64Data });
    if (!result.ok) {
      setState({ status: "error", message: result.error });
      return;
    }
    if (result.text === "") {
      setState({
        status: "error",
        message:
          "사진에서 전성분을 못 찾았어요. 다른 사진을 올리거나 직접 붙여넣어 주세요.",
      });
      return;
    }
    onText(result.text);
    setState({ status: "done" });
  } catch {
    setState({
      status: "error",
      message: "사진 인식이 안 돼요. 전성분을 직접 붙여넣어 주세요.",
    });
  }
}

export function useOcr(onText: (text: string) => void) {
  const [state, setState] = useState<OcrState>({ status: "idle" });
  return {
    state,
    processFile: (file: File) => processOcrFile(file, setState, onText),
    dismiss: () => setState({ status: "idle" }),
  };
}
