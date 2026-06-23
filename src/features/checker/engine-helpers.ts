import { ACTIVE_MAP } from "./data";
import type { Selector } from "./schema";

type Resolution = "separate-am-pm" | "alternate-days" | "buffer-wait";

export function resolveResolution(
  mechanismType: string,
  severity: "high" | "moderate" | "low",
): Resolution {
  if (mechanismType === "irritation") return "alternate-days";
  if (mechanismType === "inactivation")
    return severity === "high" ? "alternate-days" : "separate-am-pm";
  if (mechanismType === "oxidation") return "separate-am-pm";
  if (mechanismType === "ph") return "buffer-wait";
  return "separate-am-pm";
}

const STRONG_ACTIVE_GROUPS = new Set(["RETINOID", "AHA", "BHA"]);
const STRONG_ACTIVE_IDS = new Set(["l-ascorbic-acid", "benzoyl-peroxide"]);

export function isStrongActive(id: string): boolean {
  const active = ACTIVE_MAP.get(id);
  if (!active) return false;
  if (STRONG_ACTIVE_IDS.has(id)) return true;
  return active.groups.some((g) => STRONG_ACTIVE_GROUPS.has(g));
}

export function selectorMatches(selector: Selector, activeId: string): boolean {
  if ("id" in selector) return selector.id === activeId;
  const active = ACTIVE_MAP.get(activeId);
  return active?.groups.includes(selector.group) ?? false;
}

export function selectorSpecificity(selector: Selector): number {
  return "id" in selector ? 2 : 1;
}
