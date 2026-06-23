import { describe, it, expect } from "vitest";
import { aggregateTopPairs } from "./queries";

describe("aggregateTopPairs", () => {
  it("빈 배열을 받으면 빈 배열을 반환한다", () => {
    expect(aggregateTopPairs([], 10)).toEqual([]);
  });

  it("같은 쌍이 반복되면 count를 합산한다", () => {
    const rows = [
      { active_a: "niacinamide", active_b: "arbutin" },
      { active_a: "niacinamide", active_b: "arbutin" },
      { active_a: "niacinamide", active_b: "arbutin" },
    ];
    const result = aggregateTopPairs(rows, 10);
    expect(result).toHaveLength(1);
    expect(result[0]!.count).toBe(3);
  });

  it("(a,b)와 (b,a)를 같은 쌍으로 취급한다", () => {
    const rows = [
      { active_a: "niacinamide", active_b: "arbutin" },
      { active_a: "arbutin", active_b: "niacinamide" },
    ];
    const result = aggregateTopPairs(rows, 10);
    expect(result).toHaveLength(1);
    expect(result[0]!.count).toBe(2);
  });

  it("count 내림차순으로 정렬된다", () => {
    const rows = [
      { active_a: "retinol", active_b: "kojic-acid" },
      { active_a: "niacinamide", active_b: "arbutin" },
      { active_a: "niacinamide", active_b: "arbutin" },
      { active_a: "niacinamide", active_b: "arbutin" },
    ];
    const result = aggregateTopPairs(rows, 10);
    expect(result[0]!.count).toBeGreaterThanOrEqual(result[1]!.count);
  });

  it("limit 인수로 결과 수를 제한한다", () => {
    const rows = [
      { active_a: "a", active_b: "b" },
      { active_a: "c", active_b: "d" },
      { active_a: "e", active_b: "f" },
    ];
    const result = aggregateTopPairs(rows, 2);
    expect(result).toHaveLength(2);
  });

  it("각 결과 항목은 active_a, active_b, count를 포함한다", () => {
    const rows = [{ active_a: "retinol", active_b: "kojic-acid" }];
    const result = aggregateTopPairs(rows, 10);
    expect(result[0]).toMatchObject({
      active_a: expect.any(String),
      active_b: expect.any(String),
      count: expect.any(Number),
    });
  });
});
