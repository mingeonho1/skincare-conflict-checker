"use client";

import { PRESETS } from "@/features/checker/presets";
import type { Preset } from "@/features/checker/presets";

type Props = {
  atMax: boolean;
  onPick: (preset: Preset) => void;
};

export function PresetChips({ atMax, onPick }: Props) {
  return (
    <div className="mb-5">
      <p
        className="mb-2 text-xs font-medium"
        style={{ color: "var(--color-ink-sub)" }}
      >
        유형으로 빠르게 시작하기
      </p>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onPick(preset)}
            disabled={atMax}
            aria-label={`${preset.label} 프리셋 추가`}
            className="rounded-[var(--radius-control)] px-3 py-1.5 text-xs font-medium transition-all duration-150 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-55"
            style={{
              background: "var(--color-surface-raised)",
              border: "1px solid var(--color-border)",
              color: "var(--color-ink-sub)",
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <p
        className="mt-1.5 text-xs"
        style={{ color: "var(--color-ink-weak, var(--color-ink-sub))" }}
      >
        {atMax
          ? "최대 6개까지 추가했어요."
          : "대표 성분 기준이라 실제 제품과 다를 수 있어요."}
      </p>
    </div>
  );
}
