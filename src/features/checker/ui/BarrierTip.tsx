import { Leaf } from "lucide-react";
import type { CheckResult } from "@/features/checker/schema";

type Props = {
  barrierTip: CheckResult["barrierTip"];
};

export function BarrierTip({ barrierTip }: Props) {
  if (!barrierTip.recommend || !barrierTip.missingSupport) return null;

  return (
    <div
      className="flex items-start gap-3 rounded-[var(--radius-card)] px-4 py-3 text-sm"
      style={{
        background: "var(--color-safe-bg)",
        border: "1px solid var(--color-safe-border)",
        color: "var(--color-safe-text)",
      }}
      role="note"
      aria-label="장벽 케어 팁"
    >
      <Leaf size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>
        히알루론산·판테놀·센텔라 같은 진정 성분을 곁들이면 레티놀/산 자극이
        줄어요.
      </span>
    </div>
  );
}
