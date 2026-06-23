import { AlertTriangle, Pin } from "lucide-react";
import type { WarningItem } from "@/features/checker/schema";
import { MechanismBadgeRow, ActionBox, SourceLink } from "./CardShared";

const RESOLUTION_LABELS: Record<WarningItem["resolution"], string> = {
  "alternate-days": "격일로 번갈아 사용하세요 (스킨 사이클링)",
  "separate-am-pm": "한쪽은 아침, 다른 쪽은 저녁에 사용하세요",
  "buffer-wait":
    "첫 번째 제품을 충분히 흡수시킨 후 (15~20분) 두 번째 제품을 사용하세요",
};

function badgeStyle(color: string): React.CSSProperties {
  return {
    background: "var(--color-warn-badge)",
    color,
    borderRadius: "var(--radius-badge)",
    fontSize: "0.75rem",
    fontWeight: 600,
    padding: "2px 8px",
  };
}

type Props = { warning: WarningItem; index: number };

export function WarningCard({ warning, index }: Props) {
  const isHigh = warning.severity === "high";
  const color = isHigh
    ? "var(--color-warn-high)"
    : "var(--color-warn-moderate)";
  const label = isHigh ? "따로 쓰세요" : "시간차 권장";

  return (
    <article
      aria-labelledby={`warning-heading-${index}`}
      style={{
        background: isHigh
          ? "var(--color-warn-high-bg)"
          : "var(--color-warn-bg)",
        border: `1px solid ${isHigh ? "var(--color-warn-high-border)" : "var(--color-warn-border)"}`,
        borderLeft: `4px solid ${isHigh ? "var(--color-warn-high)" : "var(--color-warn-moderate)"}`,
        borderRadius: "var(--radius-card)",
        padding: "1.25rem",
        transition: "transform 150ms ease-out, box-shadow 150ms ease-out",
      }}
      className="hover:-translate-y-0.5 hover:shadow-md"
    >
      <MechanismBadgeRow
        mechanismType={warning.mechanismType}
        confidence={warning.confidence}
        badgeContent={label}
        badgeStyle={badgeStyle(color)}
      />
      <h3
        id={`warning-heading-${index}`}
        className="flex items-center gap-2 text-base font-semibold"
        style={{ color: "var(--color-warn-text)" }}
      >
        <AlertTriangle size={18} aria-hidden="true" />
        {warning.displayNames[0]} + {warning.displayNames[1]}
      </h3>
      <p
        className="mt-2 text-sm leading-relaxed"
        style={{ color: "var(--color-ink-sub)" }}
      >
        {warning.mechanism}
      </p>
      <ActionBox
        action={warning.action}
        iconColor="var(--color-warn-moderate)"
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
          {RESOLUTION_LABELS[warning.resolution]}
        </span>
      </div>
      <SourceLink label={warning.source.label} url={warning.source.url} />
    </article>
  );
}
