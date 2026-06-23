import { describe, it, expect } from "vitest";
import { judge } from "./engine";
import { RULES, ACTIVES } from "./data";

describe("judge", () => {
  // ── Core regression tests ────────────────────────────────────
  it("레티놀 × AHA 글라이콜릭 → caution (retinoid-aha group rule)", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["retinol", "glycolic-acid"] },
    ]);
    const caution = result.cautions.find((c) => c.ruleId === "retinoid-aha");
    expect(caution).toBeDefined();
    expect(caution?.verdict).toBe("caution");
    expect(caution?.severity).toBe("moderate");
  });

  it("레티놀 × BHA → caution (retinoid-bha group rule)", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["retinol", "salicylic-acid"] },
    ]);
    const caution = result.cautions.find((c) => c.ruleId === "retinoid-bha");
    expect(caution).toBeDefined();
    expect(caution?.verdict).toBe("caution");
  });

  it("순수 비타민C × BPO → warn (lascorbic-bpo)", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["l-ascorbic-acid", "benzoyl-peroxide"] },
    ]);
    const warning = result.warnings.find((w) => w.ruleId === "lascorbic-bpo");
    expect(warning).toBeDefined();
    expect(warning?.verdict).toBe("warn");
    expect(warning?.severity).toBe("moderate");
  });

  it("레티놀 × BPO → caution (retinol-bpo id-id rule)", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["retinol", "benzoyl-peroxide"] },
    ]);
    const caution = result.cautions.find((c) => c.ruleId === "retinol-bpo");
    expect(caution).toBeDefined();
    expect(caution?.verdict).toBe("caution");
    expect(caution?.severity).toBe("moderate");
  });

  it("나이아신아마이드 × 순수 비타민C → 안심(myth)", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["niacinamide", "l-ascorbic-acid"] },
    ]);
    expect(result.warnings).toHaveLength(0);
    expect(result.cautions).toHaveLength(0);
    const safeNote = result.safeNotes.find(
      (s) => s.ruleId === "niacinamide-vitc-pure",
    );
    expect(safeNote).toBeDefined();
    expect(safeNote?.confidence).toBe("myth");
  });

  it("나이아신아마이드 × 레티놀 → safeNotes에 retinoid-niacinamide 시너지 규칙", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["niacinamide", "retinol"] },
    ]);
    expect(result.warnings).toHaveLength(0);
    expect(result.cautions).toHaveLength(0);
    const safeNote = result.safeNotes.find(
      (s) => s.ruleId === "retinoid-niacinamide",
    );
    expect(safeNote).toBeDefined();
    expect(safeNote?.confidence).toBe("established");
  });

  it("규칙 없는 쌍은 결과에 없음", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["hyaluronic-acid", "peptide"] },
    ]);
    expect(result.warnings).toHaveLength(0);
    expect(result.cautions).toHaveLength(0);
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
      {
        productIndex: 0,
        activeIds: [
          "tretinoin",
          "benzoyl-peroxide",
          "copper-peptide",
          "l-ascorbic-acid",
        ],
      },
    ]);
    if (result.warnings.length >= 2) {
      const firstModerateIdx = result.warnings.findIndex(
        (w) => w.severity === "moderate",
      );
      const lastHighIdx = result.warnings
        .map((w) => w.severity)
        .lastIndexOf("high");
      if (firstModerateIdx >= 0 && lastHighIdx >= 0) {
        expect(lastHighIdx).toBeLessThan(firstModerateIdx);
      }
    }
  });

  it("히알루론산(SUPPORT)은 중복 경고에서 제외", () => {
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
        activeIds: ["retinol", "glycolic-acid", "niacinamide"],
      },
    ]);
    expect(result.cautions.some((c) => c.ruleId === "retinoid-aha")).toBe(true);
    expect(result.safeNotes.some((s) => s.ruleId === "niacinamide-aha")).toBe(
      true,
    );
  });

  // ── T-spec tests (specificity resolution) ──────────────────
  it("T-spec1: adapalene + benzoyl-peroxide → safeNotes (adapalene-bpo beats retinoid-bpo)", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["adapalene", "benzoyl-peroxide"] },
    ]);
    expect(result.warnings).toHaveLength(0);
    expect(result.cautions).toHaveLength(0);
    const safeNote = result.safeNotes.find((s) => s.ruleId === "adapalene-bpo");
    expect(safeNote).toBeDefined();
  });

  it("T-spec2: retinol + benzoyl-peroxide → cautions (retinol-bpo id-id rule)", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["retinol", "benzoyl-peroxide"] },
    ]);
    const caution = result.cautions.find((c) => c.ruleId === "retinol-bpo");
    expect(caution).toBeDefined();
    expect(caution?.verdict).toBe("caution");
  });

  it("T-spec3: tretinoin + benzoyl-peroxide → warnings (tretinoin-bpo, severity high)", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["tretinoin", "benzoyl-peroxide"] },
    ]);
    const warning = result.warnings.find((w) => w.ruleId === "tretinoin-bpo");
    expect(warning).toBeDefined();
    expect(warning?.verdict).toBe("warn");
    expect(warning?.severity).toBe("high");
  });

  it("T-spec4: SAP(VITC_DERIV) + benzoyl-peroxide → silence (no rule)", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["sap", "benzoyl-peroxide"] },
    ]);
    expect(result.warnings).toHaveLength(0);
    expect(result.cautions).toHaveLength(0);
  });

  it("T-spec5: niacinamide + l-ascorbic-acid → safeNotes (myth)", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["niacinamide", "l-ascorbic-acid"] },
    ]);
    const safe = result.safeNotes.find(
      (s) => s.ruleId === "niacinamide-vitc-pure",
    );
    expect(safe).toBeDefined();
    expect(safe?.confidence).toBe("myth");
  });

  it("barrierTip: retinol only (strong active, no SUPPORT) → missingSupport=true", () => {
    const result = judge([{ productIndex: 0, activeIds: ["retinol"] }]);
    expect(result.barrierTip.recommend).toBe(true);
    expect(result.barrierTip.missingSupport).toBe(true);
  });

  it("barrierTip: retinol + hyaluronic-acid (SUPPORT present) → missingSupport=false", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["retinol", "hyaluronic-acid"] },
    ]);
    expect(result.barrierTip.recommend).toBe(false);
    expect(result.barrierTip.missingSupport).toBe(false);
  });

  it("alternateDaySuggestions: retinol + glycolic-acid → has suggestion (irritation mechanismType)", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["retinol", "glycolic-acid"] },
    ]);
    expect(result.alternateDaySuggestions.length).toBeGreaterThan(0);
  });

  it("myth safe cards: niacinamide×l-ascorbic-acid confidence is 'myth'", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["niacinamide", "l-ascorbic-acid"] },
    ]);
    const safe = result.safeNotes.find(
      (s) => s.ruleId === "niacinamide-vitc-pure",
    );
    expect(safe?.confidence).toBe("myth");
  });

  it("myth safe cards: niacinamide×glycolic-acid confidence is 'myth'", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["niacinamide", "glycolic-acid"] },
    ]);
    const safe = result.safeNotes.find((s) => s.ruleId === "niacinamide-aha");
    expect(safe?.confidence).toBe("myth");
  });

  it("data integrity: every rule selector group exists in some active.groups", () => {
    const allGroups = new Set(
      ACTIVES.flatMap((a: { groups: string[] }) => a.groups),
    );
    for (const rule of RULES) {
      for (const sel of rule.pair) {
        if ("group" in sel) {
          expect(allGroups.has(sel.group)).toBe(true);
        }
      }
    }
  });

  // ── A1 (Round 3): ethyl-ascorbic-acid BPO reclassification ────
  it("R3: ethyl-ascorbic-acid + benzoyl-peroxide → silent (BPO-tolerant stabilised derivative)", () => {
    const result = judge([
      {
        productIndex: 0,
        activeIds: ["ethyl-ascorbic-acid", "benzoyl-peroxide"],
      },
    ]);
    expect(result.warnings).toHaveLength(0);
    expect(result.cautions).toHaveLength(0);
  });

  it("R3: l-ascorbic-acid + benzoyl-peroxide → warn (pure form only)", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["l-ascorbic-acid", "benzoyl-peroxide"] },
    ]);
    const warning = result.warnings.find((w) => w.ruleId === "lascorbic-bpo");
    expect(warning).toBeDefined();
    expect(warning?.verdict).toBe("warn");
  });

  it("R3: ethyl-ascorbic-acid + copper-peptide → warn (antioxidant destabilises copper peptide)", () => {
    const result = judge([
      {
        productIndex: 0,
        activeIds: ["ethyl-ascorbic-acid", "copper-peptide"],
      },
    ]);
    const warning = result.warnings.find(
      (w) => w.ruleId === "copper-peptide-vitc-pure",
    );
    expect(warning).toBeDefined();
    expect(warning?.verdict).toBe("warn");
  });

  it("R3: SAP + benzoyl-peroxide → silent (VITC_DERIV not covered)", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["sap", "benzoyl-peroxide"] },
    ]);
    expect(result.warnings).toHaveLength(0);
    expect(result.cautions).toHaveLength(0);
  });

  it("R3: MAP + benzoyl-peroxide → silent (VITC_DERIV not covered)", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["map", "benzoyl-peroxide"] },
    ]);
    expect(result.warnings).toHaveLength(0);
    expect(result.cautions).toHaveLength(0);
  });

  // ── A2: synergy safe rules ────────────────────────────────────
  it("A2: retinol × niacinamide → safe/synergy (retinoid-niacinamide)", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["retinol", "niacinamide"] },
    ]);
    const safe = result.safeNotes.find(
      (s) => s.ruleId === "retinoid-niacinamide",
    );
    expect(safe).toBeDefined();
    expect(safe?.mechanismType).toBe("synergy");
  });

  it("A2: l-ascorbic-acid × vitamin-e → safe/synergy (vitc-vitamin-e-ferulic)", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["l-ascorbic-acid", "vitamin-e"] },
    ]);
    const safe = result.safeNotes.find(
      (s) => s.ruleId === "vitc-vitamin-e-ferulic",
    );
    expect(safe).toBeDefined();
    expect(safe?.mechanismType).toBe("synergy");
  });

  // ── A3: resolution field ──────────────────────────────────────
  it("A3: retinoid×AHA caution has resolution='alternate-days' (irritation)", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["retinol", "glycolic-acid"] },
    ]);
    const caution = result.cautions.find((c) => c.ruleId === "retinoid-aha");
    expect(caution?.resolution).toBe("alternate-days");
  });

  it("A3: vitc×BPO warning has resolution='separate-am-pm' (oxidation)", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["l-ascorbic-acid", "benzoyl-peroxide"] },
    ]);
    const warning = result.warnings.find((w) => w.ruleId === "lascorbic-bpo");
    expect(warning?.resolution).toBe("separate-am-pm");
  });

  it("A3: tretinoin×BPO warning has resolution='alternate-days' (inactivation+high)", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["tretinoin", "benzoyl-peroxide"] },
    ]);
    const warning = result.warnings.find((w) => w.ruleId === "tretinoin-bpo");
    expect(warning?.resolution).toBe("alternate-days");
  });

  it("A3: tretinoin×BPO → in alternateDaySuggestions (inactivation+high)", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["tretinoin", "benzoyl-peroxide"] },
    ]);
    expect(result.alternateDaySuggestions.length).toBeGreaterThan(0);
  });

  it("A3: copper-peptide×AHA caution has resolution='buffer-wait' (ph)", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["copper-peptide", "glycolic-acid"] },
    ]);
    const warning = result.warnings.find(
      (w) => w.ruleId === "copper-peptide-aha",
    );
    expect(warning?.resolution).toBe("buffer-wait");
  });

  // ── A4: noRulePairs ───────────────────────────────────────────
  it("A4: judge returns noRulePairs for genuine active↔active uncovered pairs", () => {
    // kojic-acid × arbutin — both brighteners, no rule defined
    const result = judge([
      { productIndex: 0, activeIds: ["kojic-acid", "arbutin"] },
    ]);
    expect(result.noRulePairs.length).toBeGreaterThan(0);
    expect(
      result.noRulePairs.some(
        ([a, b]) =>
          (a === "kojic-acid" && b === "arbutin") ||
          (a === "arbutin" && b === "kojic-acid"),
      ),
    ).toBe(true);
  });

  // ── C1: myth field ────────────────────────────────────────────
  it("C1: niacinamide×vitC safeNote has myth string", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["niacinamide", "l-ascorbic-acid"] },
    ]);
    const safe = result.safeNotes.find(
      (s) => s.ruleId === "niacinamide-vitc-pure",
    );
    expect(safe?.myth).toBeDefined();
    expect(typeof safe?.myth).toBe("string");
    expect(safe?.myth?.length).toBeGreaterThan(0);
  });

  // ── B: support ingredients excluded from noRulePairs ──────────
  it("B: SUPPORT 성분(히알루론산) 포함 쌍은 noRulePairs에 들어가지 않는다", () => {
    // hyaluronic-acid is a SUPPORT-group ingredient — its unknown pairs
    // are always trivially safe and must not pollute the flywheel log
    const result = judge([
      { productIndex: 0, activeIds: ["hyaluronic-acid", "niacinamide"] },
    ]);
    expect(
      result.noRulePairs.some(
        ([a, b]) => a === "hyaluronic-acid" || b === "hyaluronic-acid",
      ),
    ).toBe(false);
  });

  it("B: 실제 액티브 대 액티브 미지 쌍은 noRulePairs에 포함된다", () => {
    // niacinamide × arbutin has no rule — should appear as a genuine unknown
    const result = judge([
      { productIndex: 0, activeIds: ["niacinamide", "arbutin"] },
    ]);
    expect(
      result.noRulePairs.some(
        ([a, b]) =>
          (a === "niacinamide" && b === "arbutin") ||
          (a === "arbutin" && b === "niacinamide"),
      ),
    ).toBe(true);
  });

  it("B: sunscreen은 support anchor라 noRulePairs에 들어가지 않는다", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["sunscreen", "retinol"] },
    ]);
    expect(
      result.noRulePairs.some(
        ([a, b]) => a === "sunscreen" || b === "sunscreen",
      ),
    ).toBe(false);
  });

  // ── D: new myth safe cards ──────────────────────────────────────
  it("D: salicylic-acid × niacinamide → safe (myth), has myth string, has source", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["salicylic-acid", "niacinamide"] },
    ]);
    const safe = result.safeNotes.find(
      (s) => s.ruleId === "salicylic-niacinamide",
    );
    expect(safe).toBeDefined();
    expect(safe?.confidence).toBe("myth");
    expect(safe?.myth).toBeTruthy();
    expect(safe?.source.url).toBeTruthy();
  });

  it("D: l-ascorbic-acid × hyaluronic-acid → safe (established), has source", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["l-ascorbic-acid", "hyaluronic-acid"] },
    ]);
    const safe = result.safeNotes.find(
      (s) => s.ruleId === "lascorbic-hyaluronic",
    );
    expect(safe).toBeDefined();
    expect(safe?.confidence).toBe("established");
    expect(safe?.source.url).toBeTruthy();
  });

  it("D: mandelic-acid × niacinamide → safe (myth), has myth string, has source", () => {
    const result = judge([
      { productIndex: 0, activeIds: ["mandelic-acid", "niacinamide"] },
    ]);
    const safe = result.safeNotes.find(
      (s) => s.ruleId === "mandelic-niacinamide",
    );
    expect(safe).toBeDefined();
    expect(safe?.confidence).toBe("myth");
    expect(safe?.myth).toBeTruthy();
    expect(safe?.source.url).toBeTruthy();
  });
});
