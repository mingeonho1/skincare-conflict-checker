#!/bin/bash
# verify.sh — Stop 훅
# 세션 종료 전 pnpm check(lint + typecheck + test)를 강제한다.
# 실패 시 exit 2로 종료를 막고 수정을 요구한다. "통과 못 하면 끝낼 수 없다."

INPUT=$(cat)

# 무한 루프 방지: 이 훅이 이미 종료를 한 번 막은 상태면 통과시킨다.
if command -v jq >/dev/null 2>&1; then
  ACTIVE=$(printf '%s' "$INPUT" | jq -r '.stop_hook_active // false' 2>/dev/null)
else
  ACTIVE=$(printf '%s' "$INPUT" | python3 -c 'import json,sys; print(str(json.load(sys.stdin).get("stop_hook_active", False)).lower())' 2>/dev/null)
fi
[ "$ACTIVE" = "true" ] && exit 0

# 아직 앱 코드가 없는 단계(하네스만 있는 상태)면 통과
[ ! -f package.json ] && exit 0

# package.json에 check 스크립트가 없으면 통과 (셋업 초기)
if command -v jq >/dev/null 2>&1; then
  HAS_CHECK=$(jq -r '.scripts.check // empty' package.json 2>/dev/null)
else
  HAS_CHECK=$(python3 -c 'import json; print(json.load(open("package.json")).get("scripts",{}).get("check",""))' 2>/dev/null)
fi
[ -z "$HAS_CHECK" ] && exit 0

# README 가드: 제품 빌드(PLAN.md 존재)인데 README가 아직 템플릿 스켈레톤이면 막는다.
# 결정론적 검사만 훅이 한다 — 실제 README 작성은 에이전트가 PLAN.md 기반으로.
README_PROBLEM=""
if [ -f PLAN.md ] && [ -f README.md ] && grep -q "mvp-factory:README-TODO" README.md; then
  README_PROBLEM="README.md가 아직 팩토리 템플릿 스켈레톤입니다. PLAN.md를 바탕으로 '이 제품'의 설명으로 교체하고 상단 'mvp-factory:README-TODO' 센티넬을 지우세요. (팩토리 설명은 FACTORY.md — 건드리지 마세요.)"
fi

# 디자인 게이트: 제품 빌드(PLAN.md 존재)는 (1) 고유 아이덴티티 문서 DESIGN.md가 있어야 하고
# (2) globals.css의 팩토리 기본 토큰 센티넬이 제거돼 있어야 한다(= 제품 토큰으로 교체됨).
# 결정론적 검사만 — 실제 시각 품질은 design-reviewer 에이전트가 본다.
DESIGN_PROBLEM=""
if [ -f PLAN.md ]; then
  if [ ! -f DESIGN.md ]; then
    DESIGN_PROBLEM="DESIGN.md가 없습니다. design 스킬 Phase 0~1(무드보드·레퍼런스·형용사 3개·팔레트)을 DESIGN.md에 기록하세요. 제품마다 고유 아이덴티티를 설계해야 '다 비슷한' 결과를 피합니다."
  fi
  GLOBALS=$(find src -name "globals.css" 2>/dev/null | head -1)
  if [ -n "$GLOBALS" ] && grep -q "mvp-factory:DEFAULT-TOKENS" "$GLOBALS"; then
    if [ -n "$DESIGN_PROBLEM" ]; then DESIGN_PROBLEM="$DESIGN_PROBLEM"$'\n  '; fi
    DESIGN_PROBLEM="${DESIGN_PROBLEM}globals.css가 아직 팩토리 기본 토큰(파랑+회색)입니다. 이 제품 아이덴티티 토큰으로 교체하고 'mvp-factory:DEFAULT-TOKENS' 센티넬 줄을 지우세요 (design 스킬 Phase 2)."
  fi
fi

# 품질 게이트 실행
OUTPUT=$(pnpm check 2>&1)
STATUS=$?

if [ $STATUS -ne 0 ] || [ -n "$README_PROBLEM" ] || [ -n "$DESIGN_PROBLEM" ]; then
  echo "STOP 게이트 실패 — 아래를 해결하기 전에는 작업을 종료할 수 없습니다:" >&2
  [ -n "$README_PROBLEM" ] && echo "• $README_PROBLEM" >&2
  [ -n "$DESIGN_PROBLEM" ] && echo "• $DESIGN_PROBLEM" >&2
  if [ $STATUS -ne 0 ]; then
    echo "• pnpm check 실패:" >&2
    # 마지막 60줄만 전달해 컨텍스트를 아낀다
    echo "$OUTPUT" | tail -60 >&2
  fi
  exit 2
fi

exit 0
