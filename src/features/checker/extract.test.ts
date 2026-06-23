import { describe, it, expect } from "vitest";
import { extractByKeyword } from "./extract";

describe("extractByKeyword", () => {
  it("한글 별칭으로 BHA를 추출한다", () => {
    const result = extractByKeyword("살리실릭애씨드 2%, 정제수");
    expect(result).toContain("salicylic-acid");
  });

  it("영문으로 살리실산을 추출한다", () => {
    const result = extractByKeyword("salicylic acid 2%, water");
    expect(result).toContain("salicylic-acid");
  });

  it("대소문자 무시", () => {
    const result = extractByKeyword("Salicylic Acid 2%, Aqua");
    expect(result).toContain("salicylic-acid");
  });

  it("여러 성분 동시 추출", () => {
    const result = extractByKeyword("retinol 0.1%, niacinamide 5%, water");
    expect(result).toContain("retinol");
    expect(result).toContain("niacinamide");
  });

  it("매칭 안 되는 성분은 침묵", () => {
    const result = extractByKeyword("알로에베라, 정제수, 글리세린");
    expect(result).toHaveLength(0);
  });

  it("중복 없이 반환", () => {
    const result = extractByKeyword("retinol 0.1%, retinol 0.5%, water");
    expect(result.filter((id) => id === "retinol")).toHaveLength(1);
  });

  it("비타민C 한글 별칭 → l-ascorbic-acid", () => {
    const result = extractByKeyword("아스코빅애씨드 15%, 정제수");
    expect(result).toContain("l-ascorbic-acid");
  });
});
