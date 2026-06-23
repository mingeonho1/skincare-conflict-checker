import { Info } from "lucide-react";

type DuplicateActiveWithName = {
  activeId: string;
  displayName: string;
  productIndices: number[];
};

type Props = {
  duplicates: DuplicateActiveWithName[];
};

export function DuplicateActivesNotice({ duplicates }: Props) {
  if (duplicates.length === 0) return null;

  return (
    <div className="space-y-2">
      {duplicates.map((dup) => {
        const productLabels = dup.productIndices.map((i) => `${i + 1}번`);
        const joined = productLabels.join("·");

        return (
          <div
            key={dup.activeId}
            className="flex items-start gap-2 rounded-[var(--radius-card)] px-4 py-3 text-sm"
            style={{
              background: "var(--color-tip-bg)",
              border: "1px solid var(--color-tip-border)",
              color: "var(--color-tip-text)",
            }}
            role="note"
          >
            <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              <strong>{dup.displayName}</strong>가 제품 {joined} 모두에
              들어있어요 — 중복 시 자극이 커질 수 있어요
            </span>
          </div>
        );
      })}
    </div>
  );
}
