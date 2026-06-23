import { describe, it, expect, vi, afterEach } from "vitest";

describe("extractWithLlm", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("GEMINI_API_KEY 없으면 usedLlm=false 반환 (throw 없음)", async () => {
    vi.doMock("@/lib/env", () => ({
      env: {
        NODE_ENV: "test",
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_PUBLISHABLE_KEY: "test-key",
        SUPABASE_SECRET_KEY: "test-secret",
        GEMINI_API_KEY: undefined,
      },
    }));

    const { extractWithLlm } = await import("@/lib/gemini");
    const result = await extractWithLlm(["retinol 0.1%, niacinamide 5%"]);

    expect(result.usedLlm).toBe(false);
    expect(result.perProduct).toEqual([[]]);
  });

  it("GEMINI_API_KEY 없으면 perProduct가 빈 배열 배열로 반환", async () => {
    vi.doMock("@/lib/env", () => ({
      env: {
        NODE_ENV: "test",
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_PUBLISHABLE_KEY: "test-key",
        SUPABASE_SECRET_KEY: "test-secret",
        GEMINI_API_KEY: undefined,
      },
    }));

    const { extractWithLlm } = await import("@/lib/gemini");
    const result = await extractWithLlm([
      "retinol 0.1%, niacinamide 5%",
      "vitamin c serum, glycerin",
    ]);

    expect(result.usedLlm).toBe(false);
    expect(result.perProduct).toEqual([[], []]);
  });
});
