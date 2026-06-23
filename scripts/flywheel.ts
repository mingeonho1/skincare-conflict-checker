/* eslint-disable no-console */
/**
 * flywheel.ts — 큐레이션 백로그 출력
 *
 * 사용법: pnpm flywheel
 *
 * skinclash_check_log_pairs 테이블에서 "아직 규칙이 없는" 액티브 쌍을
 * 빈도순으로 집계해 stdout에 출력한다 — 다음 규칙 큐레이션 우선순위를 파악하는 용도.
 *
 * DB 미설정이면 친절한 메시지를 출력하고 exit 0 (핵심 기능에 영향 없음).
 */

import { getTopNoRulePairs } from "@/features/checker/queries";
import type { TopNoRulePair } from "@/features/checker/queries";
import { participatesInAnyRule } from "@/features/checker/data";

const TOP_N = 30;
const COL_ACTIVE = 28;
const COL_COUNT = 7;
const COL_HINT = 4; // "확장" / "신규"

function padRight(s: string, len: number): string {
  return s.length >= len ? s.slice(0, len) : s + " ".repeat(len - s.length);
}

function padLeft(s: string, len: number): string {
  return s.length >= len ? s.slice(0, len) : " ".repeat(len - s.length) + s;
}

function printTable(pairs: TopNoRulePair[]): void {
  // "확장": at least one id is already covered by an existing rule → operator should extend a rule file
  // "신규": neither id is covered by any rule (including via group membership) → brand-new pair needed
  function hint(row: TopNoRulePair): string {
    return participatesInAnyRule(row.active_a) ||
      participatesInAnyRule(row.active_b)
      ? "확장"
      : "신규";
  }

  const sep = "-".repeat(
    COL_ACTIVE + 3 + COL_ACTIVE + 3 + COL_COUNT + 3 + COL_HINT,
  );
  const header =
    padRight("active_a", COL_ACTIVE) +
    " | " +
    padRight("active_b", COL_ACTIVE) +
    " | " +
    padLeft("count", COL_COUNT) +
    " | " +
    padRight("유형", COL_HINT);

  console.log("\n규칙 미등록 성분 쌍 — 큐레이션 백로그 (상위 30)");
  console.log(sep);
  console.log(header);
  console.log(sep);

  for (const row of pairs) {
    console.log(
      padRight(row.active_a, COL_ACTIVE) +
        " | " +
        padRight(row.active_b, COL_ACTIVE) +
        " | " +
        padLeft(String(row.count), COL_COUNT) +
        " | " +
        padRight(hint(row), COL_HINT),
    );
  }

  console.log(sep);
  console.log(`총 ${pairs.length}쌍 (전체 집계 후 상위 ${TOP_N} 표시)\n`);
  console.log(
    "유형: 확장 = 한쪽 성분이 기존 규칙에 이미 등장, 신규 = 둘 다 처음\n",
  );
}

async function main(): Promise<void> {
  const pairs = await getTopNoRulePairs(TOP_N);

  if (pairs.length === 0) {
    console.log(
      "\n집계할 데이터가 없거나 DB가 설정되지 않았어요.\n" +
        "  · Supabase env(SUPABASE_URL / SUPABASE_SECRET_KEY)를 설정하면 로깅이 활성화됩니다.\n" +
        "  · 활성화 후 사용자가 검사를 실행하면 이 스크립트로 백로그를 확인할 수 있어요.\n",
    );
    return;
  }

  printTable(pairs);
}

main().catch((err: unknown) => {
  console.error("flywheel 실행 중 예기치 않은 오류가 발생했어요:", err);
  process.exit(1);
});
