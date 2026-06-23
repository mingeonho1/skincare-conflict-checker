import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import type { CheckResult } from "@/features/checker/schema";
import { WarningCard } from "./WarningCard";
import { CautionCard } from "./CautionCard";
import { SafeCard } from "./SafeCard";
import { BarrierTip } from "./BarrierTip";
import { AlternateDayNotice } from "./AlternateDayNotice";
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

function WarningsSection({ warnings }: { warnings: CheckResult["warnings"] }) {
  if (warnings.length === 0) return null;
  return (
    <section aria-label="따로 쓰는 게 좋아요">
      <SectionHeading
        icon={
          <AlertTriangle
            size={18}
            aria-hidden="true"
            style={{ color: "var(--color-warn-text)" }}
          />
        }
      >
        따로 쓰는 게 좋아요
      </SectionHeading>
      <div className="mt-3 space-y-3">
        {warnings.map((warning, i) => (
          <WarningCard key={warning.ruleId} warning={warning} index={i} />
        ))}
      </div>
    </section>
  );
}

function CautionsSection({ cautions }: { cautions: CheckResult["cautions"] }) {
  if (cautions.length === 0) return null;
  return (
    <section aria-label="살짝 신경 쓰면 좋은 조합">
      <SectionHeading
        icon={
          <AlertCircle
            size={18}
            aria-hidden="true"
            style={{ color: "var(--color-caution-text)" }}
          />
        }
      >
        살짝 신경 쓰면 좋아요
      </SectionHeading>
      <div className="mt-3 space-y-3">
        {cautions.map((caution, i) => (
          <CautionCard key={caution.ruleId} caution={caution} index={i} />
        ))}
      </div>
    </section>
  );
}

function SafeSection({ safeNotes }: { safeNotes: CheckResult["safeNotes"] }) {
  if (safeNotes.length === 0) return null;
  return (
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
        {safeNotes.map((note, i) => (
          <SafeCard key={note.ruleId} note={note} index={i} />
        ))}
      </div>
    </section>
  );
}

function TimelineSection({ result }: { result: CheckResult }) {
  const hasTimeline = result.amSteps.length > 0 || result.pmSteps.length > 0;
  if (!hasTimeline) return null;
  return (
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
  );
}

export function ResultSections({ result }: Props) {
  return (
    <>
      <WarningsSection warnings={result.warnings} />
      <CautionsSection cautions={result.cautions} />
      <SafeSection safeNotes={result.safeNotes} />
      <BarrierTip barrierTip={result.barrierTip} />
      <AlternateDayNotice suggestions={result.alternateDaySuggestions} />
      <TimelineSection result={result} />
    </>
  );
}
