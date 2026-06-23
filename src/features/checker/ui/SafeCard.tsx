import { CheckCircle2, ExternalLink } from "lucide-react";
import type { SafeNoteItem } from "@/features/checker/schema";
import { MECHANISM_LABELS } from "./CardShared";

function MythBlock({ myth, mechanism }: { myth: string; mechanism: string }) {
  return (
    <>
      <div
        className="mb-3 mt-2 rounded-lg px-3 py-2.5 text-sm"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <p
          className="text-xs font-medium"
          style={{ color: "var(--color-ink-weak)" }}
        >
          이렇게 들으셨죠?
        </p>
        <p className="mt-0.5" style={{ color: "var(--color-ink-sub)" }}>
          &ldquo;{myth}&rdquo;
        </p>
      </div>
      <p
        className="mt-1 mb-3 text-xs font-medium"
        style={{ color: "var(--color-safe-text)" }}
      >
        사실은: {mechanism}
      </p>
    </>
  );
}

function SafeCardBadges({
  isMyth,
  mechanismLabel,
}: {
  isMyth: boolean;
  mechanismLabel: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      {isMyth && (
        <span
          style={{
            background: "var(--color-safe-bg)",
            color: "var(--color-safe-text)",
            border: "1px solid var(--color-safe-border)",
            borderRadius: "var(--radius-badge)",
            fontSize: "0.75rem",
            fontWeight: 600,
            padding: "2px 8px",
          }}
        >
          ✓ 흔한 오해예요
        </span>
      )}
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
        {mechanismLabel}
      </span>
    </div>
  );
}

type Props = { note: SafeNoteItem; index: number };

export function SafeCard({ note, index }: Props) {
  const isMyth = note.confidence === "myth";
  const isContested = note.confidence === "contested";
  const mechanismLabel =
    MECHANISM_LABELS[note.mechanismType] ?? note.mechanismType;

  return (
    <article
      aria-labelledby={`safe-heading-${index}`}
      style={{
        background: "var(--color-safe-bg)",
        border: "1px solid var(--color-safe-border)",
        borderRadius: "var(--radius-card)",
        padding: "1.25rem",
        transition: "transform 150ms ease-out, box-shadow 150ms ease-out",
      }}
      className="hover:-translate-y-0.5 hover:shadow-sm"
    >
      <SafeCardBadges isMyth={isMyth} mechanismLabel={mechanismLabel} />
      <h3
        id={`safe-heading-${index}`}
        className="flex items-center gap-2 text-sm font-semibold"
        style={{ color: "var(--color-safe-text)" }}
      >
        <CheckCircle2 size={17} aria-hidden="true" />
        {note.displayNames[0]} + {note.displayNames[1]} — 함께 써도 괜찮아요
      </h3>
      {isMyth && note.myth ? (
        <MythBlock myth={note.myth} mechanism={note.mechanism} />
      ) : (
        <p
          className="mt-2 text-sm leading-relaxed"
          style={{ color: "var(--color-ink-sub)" }}
        >
          {note.mechanism}
        </p>
      )}
      {note.action && (
        <p className="mt-1 text-sm" style={{ color: "var(--color-ink-sub)" }}>
          {note.action}
        </p>
      )}
      {isContested && (
        <p className="mt-1 text-xs" style={{ color: "var(--color-ink-weak)" }}>
          전문가 의견이 갈리지만 보수적으로 안내해요.
        </p>
      )}
      <a
        href={note.source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1 text-xs"
        style={{ color: "var(--color-ink-weak)" }}
      >
        근거: {note.source.label}
        <ExternalLink size={10} aria-hidden="true" />
      </a>
    </article>
  );
}
