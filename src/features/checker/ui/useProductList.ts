"use client";

import { useState, useCallback } from "react";
import { runCheck } from "@/features/checker/actions";
import type { CheckResult } from "@/features/checker/schema";
import type { ProductEntry } from "./ProductCard";

export const MAX_PRODUCTS = 6;
export const MIN_INGREDIENT_LEN = 30;

export const PRESET: ProductEntry[] = [
  {
    name: "레티놀 세럼",
    ingredients:
      "Water, Glycerin, Retinol, Niacinamide, Sodium Hyaluronate, Tocopherol, Carbomer, Arginine",
  },
  {
    name: "비타민C 세럼",
    ingredients:
      "Water, Ascorbic Acid, Propanediol, Sodium Hyaluronate, Niacinamide, Glycerin, Xanthan Gum, Citric Acid",
  },
];

type OnResult = (result: CheckResult, names: (string | undefined)[]) => void;

type SubmitDeps = {
  products: ProductEntry[];
  setIsSubmitting: (v: boolean) => void;
  setSubmitError: (v: string | null) => void;
  onResult: OnResult;
};

export async function runSubmitCheck({
  products,
  setIsSubmitting,
  setSubmitError,
  onResult,
}: SubmitDeps) {
  setSubmitError(null);
  setIsSubmitting(true);
  try {
    const res = await runCheck({
      products: products.map((p) => ({
        name: p.name.trim() || undefined,
        ingredients: p.ingredients,
      })),
    });
    if (!res.ok) {
      setSubmitError(res.error);
      return;
    }
    onResult(
      res.result,
      products.map((p) => p.name.trim() || undefined),
    );
  } catch {
    setSubmitError("분석 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
  } finally {
    setIsSubmitting(false);
  }
}

function useToast() {
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = useCallback(() => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  }, []);
  return { toastVisible, showToast };
}

export function useProductList(onResult: OnResult) {
  const [products, setProducts] = useState<ProductEntry[]>([
    { name: "", ingredients: "" },
    { name: "", ingredients: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { toastVisible, showToast } = useToast();

  const canSubmit =
    !isSubmitting &&
    products.some((p) => p.ingredients.trim().length >= MIN_INGREDIENT_LEN);

  return {
    products,
    isSubmitting,
    submitError,
    toastVisible,
    canSubmit,
    updateField: (index: number, field: keyof ProductEntry, value: string) =>
      setProducts((prev) =>
        prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
      ),
    addProduct: () => {
      if (products.length >= MAX_PRODUCTS) {
        showToast();
        return;
      }
      setProducts((prev) => [...prev, { name: "", ingredients: "" }]);
    },
    removeProduct: (index: number) =>
      setProducts((prev) => prev.filter((_, i) => i !== index)),
    fillPreset: () => {
      setProducts(PRESET.map((p) => ({ ...p })));
      setSubmitError(null);
    },
    submitCheck: () =>
      runSubmitCheck({ products, setIsSubmitting, setSubmitError, onResult }),
  };
}
