import { describe, it, expect } from "vitest";
import { buildRoutine } from "./routine";
import type { WarningItem } from "./schema";

describe("buildRoutine", () => {
  it("광민감 성분(레티놀)은 PM에 배치", () => {
    const { pmSteps } = buildRoutine(["retinol"], []);
    expect(pmSteps.some((s) => s.activeId === "retinol")).toBe(true);
  });

  it("비타민C는 AM에 배치", () => {
    const { amSteps } = buildRoutine(["vitamin-c"], []);
    expect(amSteps.some((s) => s.activeId === "vitamin-c")).toBe(true);
  });

  it("viscosityRank 오름차순 정렬", () => {
    const { amSteps } = buildRoutine(
      ["vitamin-c", "niacinamide", "hyaluronic-acid"],
      [],
    );
    for (let i = 1; i < amSteps.length; i++) {
      const prev = amSteps[i - 1];
      const curr = amSteps[i];
      if (prev && curr) {
        expect(prev.viscosityRank).toBeLessThanOrEqual(curr.viscosityRank);
      }
    }
  });

  it("광민감 있고 선크림 없으면 needsSunscreen=true", () => {
    const { needsSunscreen } = buildRoutine(["retinol"], []);
    expect(needsSunscreen).toBe(true);
  });

  it("선크림 감지되면 needsSunscreen=false", () => {
    const { needsSunscreen } = buildRoutine(["retinol", "sunscreen"], []);
    expect(needsSunscreen).toBe(false);
  });

  it("비타민C × BPO 충돌 시 BPO는 PM으로 분리", () => {
    const vitaminCBpoWarning: WarningItem = {
      ruleId: "vitaminc-bpo",
      activeIds: ["vitamin-c", "bpo"],
      displayNames: ["비타민C(아스코르빅)", "벤조일퍼옥사이드"],
      severity: "high",
      mechanism: "...",
      action: "...",
    };
    const { amSteps, pmSteps } = buildRoutine(
      ["vitamin-c", "bpo"],
      [vitaminCBpoWarning],
    );
    expect(amSteps.some((s) => s.activeId === "vitamin-c")).toBe(true);
    expect(pmSteps.some((s) => s.activeId === "bpo")).toBe(true);
  });
});
