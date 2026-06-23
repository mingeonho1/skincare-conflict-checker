"use client";

import { useState } from "react";
import type { CheckResult } from "@/features/checker/schema";
import { ProductCardList } from "@/features/checker/ui/ProductCardList";
import { ResultView } from "@/features/checker/ui/ResultView";

type View = "input" | "result";

const ACTIVE_CHIPS = [
  "레티놀",
  "비타민C",
  "AHA/BHA",
  "나이아신아마이드",
  "벤조일퍼옥사이드",
  "펩타이드",
];

export default function HomePage() {
  const [view, setView] = useState<View>("input");
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [productNames, setProductNames] = useState<(string | undefined)[]>([]);

  function handleResult(result: CheckResult, names: (string | undefined)[]) {
    setCheckResult(result);
    setProductNames(names);
    setView("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    setView("input");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-5">
      {/* Input view — kept mounted so useProductList state survives view transitions */}
      <div className={view === "result" ? "hidden" : ""}>
        {/* hero */}
        <header className="mb-8 text-center">
          <h1
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ color: "var(--color-ink)" }}
          >
            같이써도돼?
          </h1>
          <p
            className="mt-2 text-base sm:text-lg"
            style={{ color: "var(--color-ink-sub)" }}
          >
            같이 발라도 되는지, 30초면 알아요.
          </p>

          {/* active ingredient chips */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {ACTIVE_CHIPS.map((chip) => (
              <span
                key={chip}
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  background: "var(--color-primary-subtle)",
                  color: "var(--color-primary)",
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </header>

        <ProductCardList onResult={handleResult} />
      </div>

      {view === "result" && checkResult && (
        <ResultView
          result={checkResult}
          productNames={productNames}
          onReset={handleReset}
        />
      )}
    </main>
  );
}
