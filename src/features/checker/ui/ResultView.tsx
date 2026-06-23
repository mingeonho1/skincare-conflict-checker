import { ChevronLeft } from "lucide-react";
import type { CheckResult } from "@/features/checker/schema";
import { countCurationStats } from "@/features/checker/data";
import { ResultBanners } from "./ResultBanners";
import { ResultSections } from "./ResultSections";

type Props = {
  result: CheckResult;
  productNames: (string | undefined)[];
  onReset: () => void;
};

const { activeCount, ruleCount } = countCurationStats();

export function ResultView({ result, productNames, onReset }: Props) {
  const analyzedCount = productNames.length - result.excludedProducts.length;
  const allExcluded = analyzedCount <= 0;
  const noActives = !allExcluded && result.detectedActiveIds.length === 0;
  const hasConflicts = result.warnings.length > 0 || result.cautions.length > 0;
  const hasSafeNotes = result.safeNotes.length > 0;
  const zeroFindings =
    !allExcluded && !noActives && !hasConflicts && !hasSafeNotes;
  // Only show the "silence ≠ safe" note when actives were detected — avoids
  // duplicating the already-present noActives message.
  const hasNoRulePairs =
    !noActives &&
    result.detectedActiveIds.length > 0 &&
    result.noRulePairs.length > 0;

  return (
    <div className="space-y-6">
      <ResultBanners
        result={result}
        analyzedCount={analyzedCount}
        allExcluded={allExcluded}
        noActives={noActives}
        zeroFindings={zeroFindings}
        hasNoRulePairs={hasNoRulePairs}
      />
      <ResultSections result={result} />
      <div className="pb-24">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-[var(--radius-control)] px-4 py-2.5 text-sm font-medium transition-colors duration-150 hover:bg-[var(--color-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] active:scale-[0.98]"
          style={{ color: "var(--color-ink-sub)" }}
        >
          <ChevronLeft size={16} aria-hidden="true" />
          수정하기
        </button>
      </div>
      <div
        className="fixed bottom-0 left-0 right-0 px-4 py-3 text-center text-xs"
        style={{
          background: "var(--color-surface-raised)",
          borderTop: "1px solid var(--color-border)",
          color: "var(--color-ink-weak)",
        }}
      >
        일반 정보이며 의료 조언이 아니에요. 피부과 전문의 상담을 권장해요.
        <span
          className="mx-2 hidden sm:inline"
          aria-hidden="true"
          style={{ color: "var(--color-border)" }}
        >
          ·
        </span>
        <span className="block sm:inline" style={{ marginTop: "2px" }}>
          현재 액티브 성분 {activeCount}종 · 충돌 규칙 {ruleCount}개를 검증해
          판정해요.
        </span>
        {!result.usedLlm && (
          <span
            className="ml-2 inline-block rounded-[var(--radius-badge)] px-2 py-0.5 text-xs font-medium"
            style={{
              background: "var(--color-surface)",
              color: "var(--color-ink-weak)",
              border: "1px solid var(--color-border)",
            }}
          >
            기본 분석 모드
          </span>
        )}
      </div>
    </div>
  );
}
