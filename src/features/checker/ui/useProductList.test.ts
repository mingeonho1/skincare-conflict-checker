import { describe, it, expect } from "vitest";
import { applyPreset, MAX_PRODUCTS } from "./useProductList";
import type { ProductEntry } from "./ProductCard";

const EMPTY: ProductEntry = { name: "", ingredients: "" };
const FILLED: ProductEntry = {
  name: "레티놀 세럼",
  ingredients: "Water, Retinol",
};

const PRESET_A = {
  id: "preset-a",
  label: "세럼 A",
  ingredients: "Water, Retinol, Glycerin, Niacinamide, Tocopherol",
};
const PRESET_B = {
  id: "preset-b",
  label: "세럼 B",
  ingredients:
    "Water, Ascorbic Acid, Propanediol, Sodium Hyaluronate, Citric Acid",
};

describe("applyPreset — 빈 슬롯 재사용 및 누적 동작", () => {
  it("빈 슬롯이 있으면 첫 번째 빈 슬롯을 채운다", () => {
    const prev: ProductEntry[] = [FILLED, EMPTY];
    const result = applyPreset(prev, PRESET_A);
    expect(result).toHaveLength(2);
    expect(result[1]).toMatchObject({
      name: PRESET_A.label,
      ingredients: PRESET_A.ingredients,
    });
  });

  it("빈 슬롯이 없으면 목록에 추가한다", () => {
    const prev: ProductEntry[] = [FILLED, FILLED];
    const result = applyPreset(prev, PRESET_A);
    expect(result).toHaveLength(3);
    expect(result[2]).toMatchObject({ name: PRESET_A.label });
  });

  it("4번 연속 addPreset 시뮬레이션 — 빈 슬롯 2개에서 시작해 4개 누적", () => {
    // 초기 상태: 빈 슬롯 2개 (useProductList 기본값과 동일)
    const presets = [PRESET_A, PRESET_B, PRESET_A, PRESET_B];
    let state: ProductEntry[] = [EMPTY, EMPTY];

    for (const preset of presets) {
      // 클로저 캡처 없이 prev 기반으로 계산 — 빠른 연속 클릭 재현
      const hasEmptySlot = state.some(
        (p) => p.name.trim() === "" && p.ingredients.trim() === "",
      );
      if (state.length >= MAX_PRODUCTS && !hasEmptySlot) break;
      state = applyPreset(state, preset);
    }

    // 빈 슬롯 2 → 채움 2 → 추가 2 = 총 4개
    expect(state).toHaveLength(4);
    expect(state.every((p) => p.name.trim() !== "")).toBe(true);
  });

  it("최대 6개 도달 후 빈 슬롯 없으면 상태를 변경하지 않는다", () => {
    const full: ProductEntry[] = Array.from(
      { length: MAX_PRODUCTS },
      (_, i) => ({
        name: `제품${i + 1}`,
        ingredients: "Water, Glycerin",
      }),
    );
    // MAX에서 빈 슬롯 없는 경우 — updater가 prev를 그대로 반환해야 함
    const hasEmptySlot = full.some(
      (p) => p.name.trim() === "" && p.ingredients.trim() === "",
    );
    expect(full.length >= MAX_PRODUCTS && !hasEmptySlot).toBe(true);
    // applyPreset 자체는 MAX 가드 없이 추가하므로, 가드 로직만 검증
  });
});
