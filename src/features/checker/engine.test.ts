import { describe, it, expect } from "vitest";
import { judge } from "./engine";

describe("judge", () => {
  it("레티놀 × AHA 글라이콜릭 → high 경고", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["retinol", "aha-glycolic"] },
    ]);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]?.ruleId).toBe("retinol-aha-glycolic");
    expect(result.warnings[0]?.severity).toBe("high");
  });

  it("레티놀 × BHA → high 경고", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["retinol", "bha-salicylic"] },
    ]);
    const warning = result.warnings.find((w) => w.ruleId === "retinol-bha");
    expect(warning).toBeDefined();
    expect(warning?.severity).toBe("high");
  });

  it("비타민C × BPO → high 경고", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["vitamin-c", "bpo"] },
    ]);
    const warning = result.warnings.find((w) => w.ruleId === "vitaminc-bpo");
    expect(warning).toBeDefined();
    expect(warning?.severity).toBe("high");
  });

  it("레티놀 × BPO → moderate 경고", () => {
    const result = judge([{ productIndex: 0, activeIds: ["retinol", "bpo"] }]);
    const warning = result.warnings.find((w) => w.ruleId === "retinol-bpo");
    expect(warning).toBeDefined();
    expect(warning?.severity).toBe("moderate");
  });

  it("나이아신아마이드 × 비타민C → 안심 카드", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["niacinamide", "vitamin-c"] },
    ]);
    expect(result.warnings).toHaveLength(0);
    const safeNote = result.safeNotes.find(
      (s) => s.ruleId === "niacinamide-vitaminc",
    );
    expect(safeNote).toBeDefined();
  });

  it("나이아신아마이드 × 레티놀 → 안심 카드", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["niacinamide", "retinol"] },
    ]);
    const safeNote = result.safeNotes.find(
      (s) => s.ruleId === "niacinamide-retinol",
    );
    expect(safeNote).toBeDefined();
  });

  it("레티놀 × 비타민C → 안심 카드", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["retinol", "vitamin-c"] },
    ]);
    const safeNote = result.safeNotes.find(
      (s) => s.ruleId === "retinol-vitaminc",
    );
    expect(safeNote).toBeDefined();
  });

  it("규칙 없는 쌍은 결과에 없음", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["hyaluronic-acid", "peptide"] },
    ]);
    expect(result.warnings).toHaveLength(0);
    expect(result.safeNotes).toHaveLength(0);
  });

  it("같은 액티브 2제품 → duplicateActives에 기록", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["retinol"] },
      { productIndex: 1, activeIds: ["retinol"] },
    ]);
    const dup = result.duplicateActives.find((d) => d.activeId === "retinol");
    expect(dup).toBeDefined();
    expect(dup?.productIndices).toEqual([0, 1]);
  });

  it("경고는 severity high 먼저 정렬", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["retinol", "bpo", "aha-glycolic"] },
    ]);
    const highWarnings = result.warnings.filter((w) => w.severity === "high");
    const moderateWarnings = result.warnings.filter(
      (w) => w.severity === "moderate",
    );
    expect(highWarnings.length).toBeGreaterThan(0);
    expect(moderateWarnings.length).toBeGreaterThan(0);
    const firstModerateIdx = result.warnings.findIndex(
      (w) => w.severity === "moderate",
    );
    const lastHighIdx = result.warnings
      .map((w) => w.severity)
      .lastIndexOf("high");
    expect(lastHighIdx).toBeLessThan(firstModerateIdx);
  });

  it("히알루론산(humectant)은 중복 경고에서 제외", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["hyaluronic-acid"] },
      { productIndex: 1, activeIds: ["hyaluronic-acid"] },
    ]);
    const dup = result.duplicateActives.find(
      (d) => d.activeId === "hyaluronic-acid",
    );
    expect(dup).toBeUndefined();
  });

  it("단일 제품 내 복수 액티브도 충돌 검사", () => {
    const result = judge([
      {
        productIndex: 0,
        activeIds: ["retinol", "aha-glycolic", "niacinamide"],
      },
    ]);
    expect(
      result.warnings.some((w) => w.ruleId === "retinol-aha-glycolic"),
    ).toBe(true);
    expect(
      result.safeNotes.some((s) => s.ruleId === "niacinamide-retinol"),
    ).toBe(true);
  });
});
