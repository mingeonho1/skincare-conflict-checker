import { CheckCircle2 } from "lucide-react";
import type { SafeNoteItem } from "@/features/checker/schema";

type Props = {
  note: SafeNoteItem;
  index: number;
};

export function SafeCard({ note, index }: Props) {
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
      <h3
        id={`safe-heading-${index}`}
        className="flex items-center gap-2 text-sm font-semibold"
        style={{ color: "var(--color-safe-text)" }}
      >
        <CheckCircle2 size={17} aria-hidden="true" />
        {note.displayNames[0]} + {note.displayNames[1]} — 함께 써도 괜찮아요
      </h3>

      <p
        className="mt-2 text-sm leading-relaxed"
        style={{ color: "var(--color-ink-sub)" }}
      >
        {note.mechanism}
      </p>
    </article>
  );
}
