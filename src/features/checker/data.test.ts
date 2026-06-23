import { describe, it, expect } from "vitest";
import {
  countCurationStats,
  participatesInAnyRule,
  ACTIVES,
  RULES,
} from "./data";

describe("countCurationStats", () => {
  it("activeCount와 ruleCount가 양수를 반환한다", () => {
    const stats = countCurationStats();
    expect(stats.activeCount).toBeGreaterThan(0);
    expect(stats.ruleCount).toBeGreaterThan(0);
  });

  it("ACTIVES 배열 길이와 일치한다", () => {
    expect(countCurationStats().activeCount).toBe(ACTIVES.length);
  });

  it("RULES 배열 길이와 일치한다", () => {
    expect(countCurationStats().ruleCount).toBe(RULES.length);
  });
});

describe("participatesInAnyRule", () => {
  it("id 선택자로 직접 등장하는 성분을 true로 반환한다", () => {
    // niacinamide appears as { id: 'niacinamide' } in rules-data-1
    expect(participatesInAnyRule("niacinamide")).toBe(true);
  });

  it("AHA 그룹 멤버인 glycolic-acid를 true로 반환한다 (group 선택자 경유)", () => {
    // glycolic-acid has groups: ['AHA'] and rules reference { group: 'AHA' }
    // previously mislabeled "신규" because buildRuleParticipantIds only stored "AHA" not member ids
    expect(participatesInAnyRule("glycolic-acid")).toBe(true);
  });

  it("RETINOID 그룹 멤버인 retinyl-palmitate를 true로 반환한다 (group 선택자 경유)", () => {
    // retinyl-palmitate has groups: ['RETINOID'] and rules reference { group: 'RETINOID' }
    expect(participatesInAnyRule("retinyl-palmitate")).toBe(true);
  });

  it("어떤 규칙에도 등장하지 않는 ceramide를 false로 반환한다", () => {
    // ceramide is in groups: ['SUPPORT'] but no rule references SUPPORT or ceramide directly
    expect(participatesInAnyRule("ceramide")).toBe(false);
  });

  it("존재하지 않는 id를 false로 반환한다", () => {
    expect(participatesInAnyRule("__not_a_real_id__")).toBe(false);
  });
});
