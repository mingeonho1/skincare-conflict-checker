import { Sun, Moon } from "lucide-react";
import type { Step } from "@/features/checker/schema";

type Props = {
  amSteps: Step[];
  pmSteps: Step[];
  needsSunscreen: boolean;
};

function TimeSlot({
  steps,
  icon,
  label,
  slotId,
}: {
  steps: Step[];
  icon: React.ReactNode;
  label: string;
  slotId: string;
}) {
  return (
    <div
      className="flex-1 rounded-[var(--radius-card)] p-4"
      style={{
        background: "var(--color-surface-raised)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div
        className="mb-3 flex items-center gap-2 text-sm font-semibold"
        id={slotId}
        style={{ color: "var(--color-ink)" }}
      >
        {icon}
        {label}
      </div>

      {steps.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-ink-weak)" }}>
          이 시간대엔 사용할 성분이 없어요
        </p>
      ) : (
        <ol aria-labelledby={slotId} className="space-y-2">
          {steps.map((step, i) => (
            <li key={step.activeId} className="flex items-center gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  background: "var(--color-primary-subtle)",
                  color: "var(--color-primary)",
                }}
                aria-label={`${i + 1}단계`}
              >
                {i + 1}
              </span>
              <span className="text-sm" style={{ color: "var(--color-ink)" }}>
                {step.displayName}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function RoutineTimeline({ amSteps, pmSteps, needsSunscreen }: Props) {
  return (
    <section aria-label="아침·저녁 사용 순서">
      <div className="flex flex-col gap-3 sm:flex-row">
        <TimeSlot
          steps={amSteps}
          icon={
            <Sun
              size={16}
              aria-hidden="true"
              style={{ color: "var(--color-tip-text)" }}
            />
          }
          label="아침"
          slotId="routine-am"
        />
        <TimeSlot
          steps={pmSteps}
          icon={
            <Moon
              size={16}
              aria-hidden="true"
              style={{ color: "var(--color-primary)" }}
            />
          }
          label="저녁"
          slotId="routine-pm"
        />
      </div>

      {needsSunscreen && (
        <div
          className="mt-3 rounded-[var(--radius-card)] px-4 py-3 text-sm"
          style={{
            background: "var(--color-tip-bg)",
            border: "1px solid var(--color-tip-border)",
            color: "var(--color-tip-text)",
          }}
          role="note"
        >
          레티놀/산 성분을 쓰는 동안엔 아침 자외선차단이 특히 중요해요
        </div>
      )}

      <p
        className="mt-3 text-center text-xs"
        style={{ color: "var(--color-ink-weak)" }}
      >
        권장 순서예요. 절대 규칙은 아니에요
      </p>
    </section>
  );
}
