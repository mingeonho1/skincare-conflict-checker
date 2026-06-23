import { Lightbulb, ExternalLink } from "lucide-react";

export const MECHANISM_LABELS: Record<string, string> = {
  irritation: "자극",
  oxidation: "산화",
  inactivation: "불활성화",
  ph: "pH",
  photosensitivity: "광민감",
  synergy: "시너지",
  drying: "건조",
};

export function MechanismBadgeRow({
  mechanismType,
  confidence,
  badgeContent,
  badgeStyle,
}: {
  mechanismType: string;
  confidence: string;
  badgeContent: React.ReactNode;
  badgeStyle: React.CSSProperties;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span style={badgeStyle}>{badgeContent}</span>
      <span
        style={{
          background: "var(--color-surface)",
          color: "var(--color-ink-weak)",
          borderRadius: "var(--radius-badge)",
          fontSize: "0.7rem",
          padding: "1px 6px",
          border: "1px solid var(--color-border)",
        }}
      >
        {MECHANISM_LABELS[mechanismType] ?? mechanismType}
      </span>
      {confidence === "contested" && (
        <span style={{ color: "var(--color-ink-weak)", fontSize: "0.7rem" }}>
          · 전문가 의견 나뉨
        </span>
      )}
    </div>
  );
}

export function ActionBox({
  action,
  iconColor,
}: {
  action: string;
  iconColor: string;
}) {
  if (!action) return null;
  return (
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
        style={{ color: iconColor }}
      />
      <span>{action}</span>
    </div>
  );
}

export function SourceLink({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 inline-flex items-center gap-1 text-xs"
      style={{ color: "var(--color-ink-weak)" }}
    >
      근거: {label}
      <ExternalLink size={10} aria-hidden="true" />
    </a>
  );
}
