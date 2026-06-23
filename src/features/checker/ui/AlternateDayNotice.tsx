import { CalendarDays } from "lucide-react";
import type { CheckResult } from "@/features/checker/schema";

type Props = {
  suggestions: CheckResult["alternateDaySuggestions"];
};

export function AlternateDayNotice({ suggestions }: Props) {
  if (suggestions.length === 0) return null;

  return (
    <div
      className="rounded-[var(--radius-card)] px-4 py-3 text-sm"
      style={{
        background: "var(--color-tip-bg)",
        border: "1px solid var(--color-tip-border)",
        color: "var(--color-tip-text)",
      }}
      role="note"
      aria-label="격일 스킨 사이클링 제안"
    >
      <div className="mb-2 flex items-center gap-2 font-semibold">
        <CalendarDays size={16} aria-hidden="true" />
        격일 사용(스킨 사이클링) 제안
      </div>
      <ul className="space-y-1">
        {suggestions.map((s, i) => (
          <li key={i} className="flex items-center gap-1">
            <span>{s.aDisplay}</span>
            <span style={{ color: "var(--color-ink-weak)" }}>×</span>
            <span>{s.bDisplay}</span>
            <span style={{ color: "var(--color-ink-weak)" }}>
              — 자극 분산을 위해 격일 권장
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
