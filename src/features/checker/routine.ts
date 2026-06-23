import { ACTIVE_MAP } from "./data";
import type { WarningItem, Step } from "./schema";

type RoutineResult = {
  amSteps: Step[];
  pmSteps: Step[];
  needsSunscreen: boolean;
};

function collectAmFixedIds(activeIds: string[]): Set<string> {
  const ids = new Set<string>();
  for (const activeId of activeIds) {
    const active = ACTIVE_MAP.get(activeId);
    if (active?.timeOfDay === "AM") ids.add(activeId);
  }
  return ids;
}

function conflictsWithAmActive(
  activeId: string,
  warnings: WarningItem[],
  amFixedIds: Set<string>,
): boolean {
  return warnings.some(
    (w) =>
      w.activeIds.includes(activeId) &&
      w.activeIds.some((id) => id !== activeId && amFixedIds.has(id)),
  );
}

function resolveTimeSlot(
  activeId: string,
  warnings: WarningItem[],
  amFixedIds: Set<string>,
): "AM" | "PM" {
  const active = ACTIVE_MAP.get(activeId);
  if (!active) return "AM";
  if (active.photosensitive || active.timeOfDay === "PM") return "PM";
  if (active.timeOfDay === "AM") return "AM";
  // timeOfDay === 'ANY': default AM, push to PM only when it conflicts with an AM active
  // so it gets separated from the conflicting ingredient (e.g. BPO away from vitamin-c)
  return conflictsWithAmActive(activeId, warnings, amFixedIds) ? "PM" : "AM";
}

export function buildRoutine(
  activeIds: string[],
  warnings: WarningItem[],
): RoutineResult {
  const amFixedIds = collectAmFixedIds(activeIds);
  const amSteps: Step[] = [];
  const pmSteps: Step[] = [];

  for (const activeId of activeIds) {
    if (activeId === "sunscreen") continue;
    const active = ACTIVE_MAP.get(activeId);
    if (!active) continue;

    const step: Step = {
      activeId: active.id,
      displayName: active.displayName,
      viscosityRank: active.viscosityRank,
    };

    if (resolveTimeSlot(activeId, warnings, amFixedIds) === "PM") {
      pmSteps.push(step);
    } else {
      amSteps.push(step);
    }
  }

  // Thinnest texture first (ascending viscosityRank)
  amSteps.sort((a, b) => a.viscosityRank - b.viscosityRank);
  pmSteps.sort((a, b) => a.viscosityRank - b.viscosityRank);

  const hasPhotosensitiveActive = activeIds.some(
    (id) => ACTIVE_MAP.get(id)?.photosensitive === true,
  );
  const needsSunscreen =
    hasPhotosensitiveActive && !activeIds.includes("sunscreen");

  return { amSteps, pmSteps, needsSunscreen };
}
