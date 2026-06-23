import { AlertTriangle, CheckCircle2, Calendar } from "lucide-react";
import type { CheckResult } from "@/features/checker/schema";
import { WarningCard } from "./WarningCard";
import { SafeCard } from "./SafeCard";
import { RoutineTimeline } from "./RoutineTimeline";

type Props = {
  result: CheckResult;
};

function SectionHeading({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <h2
      className="flex items-center gap-2 text-base font-semibold"
      style={{ color: "var(--color-ink)" }}
    >
      {icon}
      {children}
    </h2>
  );
}

export function ResultSections({ result }: Props) {
  const hasConflicts = result.warnings.length > 0;
  const hasSafeNotes = result.safeNotes.length > 0;
  const hasTimeline = result.amSteps.length > 0 || result.pmSteps.length > 0;

  return (
    <>
      {hasConflicts && (
        <section aria-label="주의가 필요한 조합">
          <SectionHeading
            icon={
              <AlertTriangle
                size={18}
                aria-hidden="true"
                style={{ color: "var(--color-warn-text)" }}
              />
            }
          >
            주의가 필요한 조합
          </SectionHeading>
          <div className="mt-3 space-y-3">
            {result.warnings.map((warning, i) => (
              <WarningCard key={warning.ruleId} warning={warning} index={i} />
            ))}
          </div>
        </section>
      )}
      {hasSafeNotes && (
        <section aria-label="함께 써도 괜찮아요">
          <SectionHeading
            icon={
              <CheckCircle2
                size={18}
                aria-hidden="true"
                style={{ color: "var(--color-safe-text)" }}
              />
            }
          >
            함께 써도 괜찮아요
          </SectionHeading>
          <div className="mt-3 space-y-3">
            {result.safeNotes.map((note, i) => (
              <SafeCard key={note.ruleId} note={note} index={i} />
            ))}
          </div>
        </section>
      )}
      {hasTimeline && (
        <section aria-label="아침·저녁 사용 순서">
          <SectionHeading
            icon={
              <Calendar
                size={18}
                aria-hidden="true"
                style={{ color: "var(--color-primary)" }}
              />
            }
          >
            아침·저녁 사용 순서
          </SectionHeading>
          <div className="mt-3">
            <RoutineTimeline
              amSteps={result.amSteps}
              pmSteps={result.pmSteps}
              needsSunscreen={result.needsSunscreen}
            />
          </div>
        </section>
      )}
    </>
  );
}
