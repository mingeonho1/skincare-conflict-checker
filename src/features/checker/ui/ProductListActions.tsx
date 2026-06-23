"use client";

import { Plus, Loader2, FlaskConical } from "lucide-react";

type Props = {
  atMax: boolean;
  isSubmitting: boolean;
  canSubmit: boolean;
  submitError: string | null;
  onAdd: () => void;
  onFillPreset: () => void;
  onSubmit: () => void;
};

const btnBase =
  "flex items-center gap-1.5 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium transition-colors duration-150 hover:bg-[var(--color-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] active:scale-[0.98]";

export function ProductListActions({
  atMax,
  isSubmitting,
  canSubmit,
  submitError,
  onAdd,
  onFillPreset,
  onSubmit,
}: Props) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAdd}
          disabled={atMax}
          className={`${btnBase} disabled:cursor-not-allowed disabled:opacity-40`}
          style={{
            border: "1px solid var(--color-border)",
            color: "var(--color-ink-sub)",
          }}
        >
          <Plus size={15} aria-hidden="true" />
          제품 추가
        </button>

        <button
          type="button"
          onClick={onFillPreset}
          className={btnBase}
          style={{
            border: "1px solid var(--color-border)",
            color: "var(--color-ink-sub)",
          }}
        >
          <FlaskConical size={15} aria-hidden="true" />
          예시로 채우기
        </button>
      </div>

      {submitError && (
        <p
          className="rounded-[var(--radius-control)] px-3 py-2 text-sm"
          style={{
            background: "var(--color-warn-bg)",
            border: "1px solid var(--color-warn-border)",
            color: "var(--color-warn-text)",
          }}
          role="alert"
        >
          {submitError}
        </p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-control)] py-3.5 text-base font-semibold text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          background: canSubmit
            ? "var(--color-primary)"
            : "var(--color-ink-weak)",
        }}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            분석 중...
          </>
        ) : (
          "충돌 검사하기"
        )}
      </button>
    </>
  );
}
