import { describe, it, expect } from "vitest";
import { PRESETS, PresetSchema } from "./presets";
import { extractByKeyword } from "./extract";

describe("프리셋 데이터", () => {
  it("T40: 8종 프리셋이 PresetSchema 통과, ingredients 30자 이상", () => {
    expect(PRESETS).toHaveLength(8);
    for (const preset of PRESETS) {
      expect(() => PresetSchema.parse(preset)).not.toThrow();
      expect(preset.ingredients.length).toBeGreaterThanOrEqual(30);
    }
  });

  it("T41: 각 프리셋이 헤드라인 액티브를 1개 이상 추출", () => {
    // 실제 actives-data의 ID 기준 (v2 확장 사전)
    const EXPECTED: Record<string, string[]> = {
      "retinol-serum": ["retinol"],
      "vitc-serum": ["l-ascorbic-acid"],
      "aha-bha-toner": ["glycolic-acid", "salicylic-acid"],
      "niacinamide-serum": ["niacinamide"],
      "bpo-treatment": ["benzoyl-peroxide"],
      "peptide-cream": ["peptide"],
      // 센텔라아시아티카추출물: centella alias에 없으나 마데카소사이드로 잡힘, 판테놀도 잡힘
      "soothing-cream": ["centella", "panthenol"],
      sunscreen: ["sunscreen"],
    };

    for (const preset of PRESETS) {
      const actives = extractByKeyword(preset.ingredients);
      const expected = EXPECTED[preset.id] ?? [];
      const hasAtLeastOne = expected.some((id) => actives.includes(id));
      expect(
        hasAtLeastOne,
        `${preset.id}: 기대 액티브(${expected.join(",")}) 중 하나가 잡혀야 함. 실제: ${actives.join(",")}`,
      ).toBe(true);
    }
  });
});
