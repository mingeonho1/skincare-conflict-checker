import { describe, it, expect } from "vitest";
import { CheckInputSchema } from "./schema";

describe("CheckInputSchema", () => {
  const makeProduct = (ingredients: string, name?: string) => ({
    name,
    ingredients,
  });

  it("2개 제품 통과", () => {
    const input = {
      products: [
        makeProduct(
          "retinol 0.1%, niacinamide 5%, water, glycerin, hyaluronic acid",
        ),
        makeProduct(
          "salicylic acid 2%, niacinamide 10%, water, glycerin, panthenol",
        ),
      ],
    };
    expect(() => CheckInputSchema.parse(input)).not.toThrow();
  });

  it("6개 제품 통과", () => {
    const product = makeProduct(
      "retinol 0.1%, niacinamide 5%, water, glycerin, hyaluronic acid",
    );
    const input = { products: Array(6).fill(product) };
    expect(() => CheckInputSchema.parse(input)).not.toThrow();
  });

  it("7개 제품 거부", () => {
    const product = makeProduct(
      "retinol 0.1%, niacinamide 5%, water, glycerin, hyaluronic acid",
    );
    const input = { products: Array(7).fill(product) };
    expect(() => CheckInputSchema.parse(input)).toThrow();
  });

  it("4000자 초과 ingredients는 거부되지 않고 4000자로 트림된다", () => {
    const input = {
      products: [{ ingredients: "a".repeat(5000) }],
    };
    const result = CheckInputSchema.parse(input);
    expect(result.products[0]?.ingredients).toHaveLength(4000);
  });

  it("ingredients 없으면 실패", () => {
    const input = {
      products: [{ name: "제품1" }],
    };
    expect(() => CheckInputSchema.parse(input)).toThrow();
  });

  it("빈 ingredients를 가진 제품이 포함되어도 파싱이 성공한다", () => {
    const input = {
      products: [
        makeProduct("retinol 0.1%, niacinamide 5%, water, glycerin"),
        makeProduct(""),
      ],
    };
    expect(() => CheckInputSchema.parse(input)).not.toThrow();
  });

  it("ingredients가 30자 미만인 제품만 있어도 파싱은 성공한다", () => {
    const input = {
      products: [makeProduct("retinol, niacinamide")],
    };
    expect(() => CheckInputSchema.parse(input)).not.toThrow();
  });
});
