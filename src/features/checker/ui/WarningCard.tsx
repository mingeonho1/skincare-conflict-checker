import { AlertTriangle, Lightbulb } from "lucide-react";
import type { WarningItem } from "@/features/checker/schema";

type Props = {
  warning: WarningItem;
  index: number;
};

export function WarningCard({ warning, index }: Props) {
  const isHigh = warning.severity === "high";
  const badgeColor = isHigh
    ? "var(--color-warn-high)"
    : "var(--color-warn-moderate)";
  const badgeLabel = isHigh ? "주의 필요" : "확인 필요";

  return (
    <article
      aria-labelledby={`warning-heading-${index}`}
      style={{
        background: "var(--color-warn-bg)",
        border: "1px solid var(--color-warn-border)",
        borderRadius: "var(--radius-card)",
        padding: "1.25rem",
        transition: "transform 150ms ease-out, box-shadow 150ms ease-out",
      }}
      className="hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* severity badge */}
      <div className="mb-3">
        <span
          style={{
            background: "var(--color-warn-badge)",
            color: badgeColor,
            borderRadius: "var(--radius-badge)",
            fontSize: "0.75rem",
            fontWeight: 600,
            padding: "2px 8px",
          }}
        >
          {badgeLabel}
        </span>
      </div>

      {/* heading */}
      <h3
        id={`warning-heading-${index}`}
        className="flex items-center gap-2 text-base font-semibold"
        style={{ color: "var(--color-warn-text)" }}
      >
        <AlertTriangle size={18} aria-hidden="true" />
        {warning.displayNames[0]} + {warning.displayNames[1]}
      </h3>

      {/* mechanism */}
      <p
        className="mt-2 text-sm leading-relaxed"
        style={{ color: "var(--color-ink-sub)" }}
      >
        {warning.mechanism}
      </p>

      {/* action */}
      <div
        className="mt-3 flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm"
        style={{
          background: "var(--color-surface)",
          color: "var(--color-ink-sub)",
        }}
      >
        <Lightbulb
          size={16}
          className="mt-0.5 shrink-0"
          aria-hidden="true"
          style={{ color: "var(--color-warn-moderate)" }}
        />
        <span>{warning.action}</span>
      </div>
    </article>
  );
}
