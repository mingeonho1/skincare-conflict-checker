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
  hasNoRulePairs: boolean;
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

function SummaryBanner({
  result,
  analyzedCount,
}: {
  result: CheckResult;
  analyzedCount: number;
}) {
  return (
    <div
      className="rounded-[var(--radius-card)] px-4 py-3 text-sm font-medium"
      style={{
        background: "var(--color-primary-subtle)",
        color: "var(--color-primary-strong)",
      }}
    >
      경고 {result.warnings.length}개 · 주의 {result.cautions.length}개 · 안심{" "}
      {result.safeNotes.length}개 · 분석한 제품 {analyzedCount}개
    </div>
  );
}

function NoActivesNote() {
  return (
    <NeutralCard>
      저희가 추적하는 액티브 성분(레티놀·산·비타민C 등)을 감지하지 못했어요.
      추적하지 않는 성분의 충돌은 확인이 어려워요.
      <details className="mt-2">
        <summary
          className="cursor-pointer text-xs"
          style={{ color: "var(--color-ink-weak)" }}
        >
          추적하는 성분 보기
        </summary>
        <p className="mt-1 text-xs" style={{ color: "var(--color-ink-weak)" }}>
          레티놀, 레티날, 트레티노인, 아다팔렌, 바쿠치올, 글라이콜릭산(AHA),
          락틱산, 살리실산(BHA), 나이아신아마이드, 순수 비타민C, 비타민C
          유도체(SAP·MAP·THD), 벤조일퍼옥사이드, 아젤라익산, 트라넥삼산, 알부틴,
          코직산, 펩타이드, 구리펩타이드 등
        </p>
      </details>
    </NeutralCard>
  );
}

function NoRulePairsNote({ pairs }: { pairs: [string, string][] }) {
  return (
    <NeutralCard>
      감지된 성분 중 일부 조합은 아직 데이터가 없어 표시하지 않았어요. 침묵은
      &lsquo;안전&rsquo;이 아니라 &lsquo;아직 모름&rsquo;이에요.
      <details className="mt-2">
        <summary
          className="cursor-pointer text-xs"
          style={{ color: "var(--color-ink-weak)" }}
        >
          데이터가 없는 조합 보기
        </summary>
        <ul
          className="mt-1 space-y-0.5 text-xs"
          style={{ color: "var(--color-ink-weak)" }}
        >
          {pairs.map(([a, b]) => {
            const nameA = ACTIVE_MAP.get(a)?.displayName ?? a;
            const nameB = ACTIVE_MAP.get(b)?.displayName ?? b;
            return (
              <li key={`${a}-${b}`}>
                {nameA} · {nameB}
              </li>
            );
          })}
        </ul>
      </details>
    </NeutralCard>
  );
}

export function ResultBanners({
  result,
  analyzedCount,
  allExcluded,
  noActives,
  zeroFindings,
  hasNoRulePairs,
}: Props) {
  const duplicatesWithName = result.duplicateActives.map((dup) => ({
    ...dup,
    displayName: ACTIVE_MAP.get(dup.activeId)?.displayName ?? dup.activeId,
  }));

  return (
    <>
      {!allExcluded && (
        <SummaryBanner result={result} analyzedCount={analyzedCount} />
      )}
      <ExcludedProductsNote indices={result.excludedProducts} />
      {allExcluded && (
        <NeutralCard>
          분석할 제품이 없어요. 전성분을 더 붙여넣어 주세요.
        </NeutralCard>
      )}
      {noActives && <NoActivesNote />}
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
      {hasNoRulePairs && <NoRulePairsNote pairs={result.noRulePairs} />}
      <DuplicateActivesNotice duplicates={duplicatesWithName} />
    </>
  );
}
