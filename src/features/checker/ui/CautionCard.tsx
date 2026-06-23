import { AlertCircle, Pin } from "lucide-react";
import type { WarningItem } from "@/features/checker/schema";
import { MechanismBadgeRow, ActionBox, SourceLink } from "./CardShared";

const BADGE_STYLE: React.CSSProperties = {
  background: "var(--color-caution-badge)",
  color: "var(--color-caution-text)",
  borderRadius: "var(--radius-badge)",
  fontSize: "0.75rem",
  fontWeight: 600,
  padding: "2px 8px",
};

const RESOLUTION_LABELS: Record<WarningItem["resolution"], string> = {
  "alternate-days": "격일로 번갈아 사용하세요 (스킨 사이클링)",
  "separate-am-pm": "한쪽은 아침, 다른 쪽은 저녁에 사용하세요",
  "buffer-wait":
    "첫 번째 제품을 충분히 흡수시킨 후 (15~20분) 두 번째 제품을 사용하세요",
};

type Props = { caution: WarningItem; index: number };

export function CautionCard({ caution, index }: Props) {
  return (
    <article
      aria-labelledby={`caution-heading-${index}`}
      style={{
        background: "var(--color-caution-bg)",
        border: "1px solid var(--color-caution-border)",
        borderRadius: "var(--radius-card)",
        padding: "1.25rem",
        transition: "transform 150ms ease-out, box-shadow 150ms ease-out",
      }}
      className="hover:-translate-y-0.5 hover:shadow-md"
    >
      <MechanismBadgeRow
        mechanismType={caution.mechanismType}
        confidence={caution.confidence}
        badgeContent="살짝 신경 쓰면 좋아요"
        badgeStyle={BADGE_STYLE}
      />
      <h3
        id={`caution-heading-${index}`}
        className="flex items-center gap-2 text-base font-semibold"
        style={{ color: "var(--color-caution-text)" }}
      >
        <AlertCircle size={18} aria-hidden="true" />
        {caution.displayNames[0]} + {caution.displayNames[1]}
      </h3>
      <p
        className="mt-2 text-sm leading-relaxed"
        style={{ color: "var(--color-ink-sub)" }}
      >
        {caution.mechanism}
      </p>
      <ActionBox
        action={caution.action}
        iconColor="var(--color-caution-text)"
      />
      <div
        className="mt-3 flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm"
        style={{
          background: "var(--color-tip-bg)",
          border: "1px solid var(--color-tip-border)",
          color: "var(--color-tip-text)",
        }}
      >
        <Pin size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>
          <span className="font-medium">이렇게 쓰세요: </span>
          {RESOLUTION_LABELS[caution.resolution]}
        </span>
      </div>
      <SourceLink label={caution.source.label} url={caution.source.url} />
    </article>
  );
}
