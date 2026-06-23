"use client";

import type { CheckResult } from "@/features/checker/schema";
import { ProductCard } from "./ProductCard";
import { ProductListActions } from "./ProductListActions";
import { PresetChips } from "./PresetChips";
import { useProductList, MAX_PRODUCTS } from "./useProductList";

type Props = {
  onResult: (result: CheckResult, productNames: (string | undefined)[]) => void;
  geminiEnabled: boolean;
};

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed left-1/2 top-5 z-50 -translate-x-1/2 transition-all duration-200"
      style={{
        opacity: visible ? 1 : 0,
        transform: `translateX(-50%) translateY(${visible ? "0" : "-8px"})`,
      }}
    >
      <div
        className="rounded-[var(--radius-control)] px-4 py-2.5 text-sm font-medium shadow-lg"
        style={{
          background: "var(--color-ink)",
          color: "var(--color-surface-raised)",
        }}
      >
        {message}
      </div>
    </div>
  );
}

export function ProductCardList({ onResult, geminiEnabled }: Props) {
  const {
    products,
    isSubmitting,
    submitError,
    toastVisible,
    canSubmit,
    updateField,
    addProduct,
    removeProduct,
    fillPreset,
    submitCheck,
    addPreset,
  } = useProductList(onResult);

  return (
    <div className="space-y-4">
      <Toast
        message="한 번에 최대 6개까지 검사할 수 있어요"
        visible={toastVisible}
      />
      <PresetChips atMax={products.length >= MAX_PRODUCTS} onPick={addPreset} />
      <div className="space-y-3">
        {products.map((product, index) => (
          <ProductCard
            key={index}
            product={product}
            index={index}
            canRemove={products.length > 2}
            geminiEnabled={geminiEnabled}
            onNameChange={(v) => updateField(index, "name", v)}
            onIngredientsChange={(v) => updateField(index, "ingredients", v)}
            onRemove={() => removeProduct(index)}
          />
        ))}
      </div>
      <ProductListActions
        atMax={products.length >= MAX_PRODUCTS}
        isSubmitting={isSubmitting}
        canSubmit={canSubmit}
        submitError={submitError}
        onAdd={addProduct}
        onFillPreset={fillPreset}
        onSubmit={submitCheck}
      />
    </div>
  );
}
