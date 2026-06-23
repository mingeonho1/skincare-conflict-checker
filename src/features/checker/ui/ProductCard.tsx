"use client";

import { X } from "lucide-react";

export type ProductEntry = {
  name: string;
  ingredients: string;
};

type Props = {
  product: ProductEntry;
  index: number;
  canRemove: boolean;
  onNameChange: (value: string) => void;
  onIngredientsChange: (value: string) => void;
  onRemove: () => void;
};

const MIN_LEN = 30;
const MAX_LEN = 4000;
const WARN_LEN = 3800;

function IngredientHint({ value }: { value: string }) {
  const len = value.trim().length;
  if (len > 0 && len < MIN_LEN) {
    return (
      <p className="mt-1 text-xs" style={{ color: "var(--color-warn-high)" }}>
        전성분을 더 붙여넣어 주세요 (30자 이상)
      </p>
    );
  }
  if (value.length > MAX_LEN) {
    return (
      <p className="mt-1 text-xs" style={{ color: "var(--color-tip-text)" }}>
        일부가 잘렸어요 — 4000자까지만 분석돼요
      </p>
    );
  }
  if (value.length > WARN_LEN) {
    return (
      <p className="mt-1 text-xs" style={{ color: "var(--color-tip-text)" }}>
        4000자에 가까워요 — 초과분은 잘려요
      </p>
    );
  }
  return null;
}

function CardHeader({
  index,
  canRemove,
  onRemove,
}: {
  index: number;
  canRemove: boolean;
  onRemove: () => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <span
        className="text-sm font-semibold"
        style={{ color: "var(--color-ink)" }}
      >
        제품 {index + 1}
      </span>
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`제품 ${index + 1} 삭제`}
          className="flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-150 hover:bg-[var(--color-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] active:scale-95"
          style={{ color: "var(--color-ink-weak)" }}
        >
          <X size={15} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function ProductCard({
  product,
  index,
  canRemove,
  onNameChange,
  onIngredientsChange,
  onRemove,
}: Props) {
  return (
    <div
      className="animate-slide-in rounded-[var(--radius-card)] p-4"
      style={{
        background: "var(--color-surface-raised)",
        border: "1px solid var(--color-border)",
      }}
    >
      <CardHeader index={index} canRemove={canRemove} onRemove={onRemove} />

      <div className="mb-3">
        <label
          htmlFor={`product-name-${index}`}
          className="mb-1 block text-xs font-medium"
          style={{ color: "var(--color-ink-sub)" }}
        >
          제품 이름 (선택)
        </label>
        <input
          id={`product-name-${index}`}
          type="text"
          value={product.name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="세럼 이름 (선택)"
          className="w-full rounded-[var(--radius-control)] px-3 py-2 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-ink)",
          }}
        />
      </div>

      <div>
        <label
          htmlFor={`product-ingredients-${index}`}
          className="mb-1 block text-xs font-medium"
          style={{ color: "var(--color-ink-sub)" }}
        >
          전성분
        </label>
        <textarea
          id={`product-ingredients-${index}`}
          rows={5}
          value={product.ingredients}
          onChange={(e) => onIngredientsChange(e.target.value)}
          placeholder={
            "전성분을 여기 붙여넣어 주세요\n예) Water, Glycerin, Niacinamide, Retinol..."
          }
          className="w-full resize-none rounded-[var(--radius-control)] px-3 py-2 text-sm leading-relaxed transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-ink)",
          }}
        />
        <IngredientHint value={product.ingredients} />
      </div>
    </div>
  );
}
