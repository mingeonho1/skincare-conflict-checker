import { Info } from "lucide-react";
import type { CheckResult } from "@/features/checker/schema";
import { ACTIVE_MAP } from "@/features/checker/data";
import { DuplicateActivesNotice } from "./DuplicateActivesNotice";

type Props = {
  result: CheckResult;
  analyzedCount: number;
  allExcluded: boolean;
  noActives: boolean;
  zeroFindings: boolean;
};

function NeutralCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[var(--radius-card)] px-4 py-4 text-sm leading-relaxed"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        color: "var(--color-ink-sub)",
      }}
    >
      {children}
    </div>
  );
}

function ExcludedProductsNote({ indices }: { indices: number[] }) {
  if (indices.length === 0) return null;
  const labels = indices.map((i) => `제품 ${i + 1}번`).join(", ");
  return (
    <div
      className="flex items-start gap-2 rounded-[var(--radius-card)] px-4 py-3 text-sm"
      style={{
        background: "var(--color-tip-bg)",
        border: "1px solid var(--color-tip-border)",
        color: "var(--color-tip-text)",
      }}
      role="note"
    >
      <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>{labels}은 전성분이 너무 짧아 분석에서 제외했어요.</span>
    </div>
  );
}

export function ResultBanners({
  result,
  analyzedCount,
  allExcluded,
  noActives,
  zeroFindings,
}: Props) {
  const duplicatesWithName = result.duplicateActives.map((dup) => ({
    ...dup,
    displayName: ACTIVE_MAP.get(dup.activeId)?.displayName ?? dup.activeId,
  }));

  return (
    <>
      {!result.usedLlm && (
        <div>
          <span
            className="inline-block rounded-[var(--radius-badge)] px-2 py-0.5 text-xs font-medium"
            style={{
              background: "var(--color-surface)",
              color: "var(--color-ink-weak)",
              border: "1px solid var(--color-border)",
            }}
          >
            기본 분석 모드
          </span>
        </div>
      )}
      {!allExcluded && (
        <div
          className="rounded-[var(--radius-card)] px-4 py-3 text-sm font-medium"
          style={{
            background: "var(--color-primary-subtle)",
            color: "var(--color-primary-strong)",
          }}
        >
          경고 {result.warnings.length}개 · 안심 {result.safeNotes.length}개 ·
          분석한 제품 {analyzedCount}개
        </div>
      )}
      <ExcludedProductsNote indices={result.excludedProducts} />
      {allExcluded && (
        <NeutralCard>
          분석할 제품이 없어요. 전성분을 더 붙여넣어 주세요.
        </NeutralCard>
      )}
      {noActives && (
        <NeutralCard>
          충돌을 일으킬 만한 액티브 성분(레티놀·산·비타민C 등)이 감지되지
          않았어요. 함께 써도 무난합니다.
        </NeutralCard>
      )}
      {zeroFindings && (
        <div
          className="rounded-[var(--radius-card)] px-4 py-4 text-sm font-medium"
          style={{
            background: "var(--color-safe-bg)",
            border: "1px solid var(--color-safe-border)",
            color: "var(--color-safe-text)",
          }}
          role="status"
        >
          검사한 조합에서 알려진 충돌이 없어요. 안심하고 사용하세요.
        </div>
      )}
      <DuplicateActivesNotice duplicates={duplicatesWithName} />
    </>
  );
}
