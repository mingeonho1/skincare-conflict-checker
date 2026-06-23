# MVP Factory 하네스 감사 (읽기 전용)

날짜: 2026-06-16 · 범위: 프로젝트 레벨 하네스 설정 전부 · 결론: 구조는 견고하나 **(1) 산문 ↔ 훅/eslint 중복 강제**, **(2) "주말/일요일" 프레이밍 유물 잔재**, **(3) write-post 계열 유지비**가 핵심 개선 포인트.

---

## 1. 요약 표

| 파일                           | 라인 | 핵심 문제                                                                                                                | 권고(한 줄)                                          |
| ------------------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| `CLAUDE.md`                    | 37   | 철칙6(더미 env) 산문이 길고 shipping §0·ci.yml과 3중 중복                                                                | 철칙6을 1줄로 줄이고 shipping §0를 정본으로 포인터화 |
| `FACTORY.md`                   | 60   | 양호. CLAUDE.md/shipping과 공유인프라·게이트 설명 부분 중복                                                              | 유지(독자=사람). 공유인프라 상세는 shipping 포인터만 |
| `README.md`                    | 23   | 양호(센티넬 가드 일관)                                                                                                   | 변경 없음                                            |
| `BUILD_LOG.md`                 | 11   | 양호(스켈레톤)                                                                                                           | 변경 없음                                            |
| `.claude/settings.json`        | 60   | `WebFetch` deny인데 lead/reviewer는 어차피 도구 제한, builder는 허용됨 → 의도 확인 필요                                  | deny 의도 명확화(주석/문서)                          |
| `agents/lead.md`               | 74   | **가장 김.** PLAN 형식+범위규칙+명세기준 혼재, "일요일/주말" 유물 3곳, `RULES.md §4` 가상 예시가 builder/reviewer에 전염 | 유물 제거 + 예시를 일반화                            |
| `agents/builder.md`            | 31   | 코드품질 기준이 eslint·conventions와 3중 중복                                                                            | 길이/타입 규칙은 "eslint가 강제"로 1줄 포인터화      |
| `agents/reviewer.md`           | 40   | 체크리스트 4·7·8이 eslint/knip로 이미 결정론적 강제됨                                                                    | "기계가 잡는 것"과 "사람이 보는 것" 분리             |
| `skills/shipping/SKILL.md`     | 90   | **두 번째로 김.** §0 더미env가 CLAUDE.md·ci.yml과 중복, §0-1 공유인프라가 CLAUDE.md·FACTORY.md와 중복, "일요일" 5곳      | 정본 선언 + 나머지 포인터화, 일요일 제거             |
| `skills/design/SKILL.md`       | 65   | description 길지 않음(조건부 로딩 OK). "주말 MVP" 1곳                                                                    | 유물 1줄 수정                                        |
| `skills/conventions/SKILL.md`  | 55   | 길이/타입/depth 규칙이 eslint.config와 중복                                                                              | eslint가 강제하는 항목은 "(eslint 강제)" 태깅        |
| `skills/architecture/SKILL.md` | 40   | 양호                                                                                                                     | 변경 없음                                            |
| `skills/log-decision/SKILL.md` | 53   | "토 14:20", "주말", "일요일 회고" 유물                                                                                   | 시각 예시·회고 라벨 탈주말화                         |
| `skills/write-post/SKILL.md`   | 104  | **최장 스킬.** "일요일 오후" 유물, 유지비 대비 사용빈도 의문                                                             | 슬림화 또는 옵션 분리(아래 §5)                       |
| `skills/blog-style/SKILL.md`   | 30   | 양호. write-post와 운명 공동체                                                                                           | write-post 결정에 종속                               |
| `scripts/tistory-post.mjs`     | 264  | **최장 파일.** 티스토리 DOM 의존 깨지기 쉬움, write-post 의존                                                            | write-post 유지 시만 의미. 별도 유지비 평가          |
| `scripts/bootstrap.sh`         | 60   | 양호. 주석이 다소 길지만 1회성 스크립트라 허용                                                                           | 변경 없음                                            |
| `.github/workflows/ci.yml`     | 43   | 더미 env가 env.ts·shipping §0와 중복(불가피한 종류)                                                                      | 정본을 shipping §0로, ci.yml 주석은 짧게             |
| `eslint.config.mjs`            | 68   | 양호(숫자 게이트의 정본). 산문 쪽이 여기를 가리키게 해야                                                                 | 정본으로 선언                                        |
| `src/lib/env.ts`               | 38   | 양호. siteUrl() 자동분기 일관                                                                                            | 변경 없음                                            |

100줄 이상: `write-post`(104), `tistory-post.mjs`(264, 코드라 별개). 70줄대: `lead.md`(74), `shipping`(90).

---

## 2. 우선순위 개선안

### 상 (HIGH) — 강제력/일관성에 직접 영향

**H1. "주말/일요일/주차" 프레이밍 유물 일괄 제거**

- (a) 무엇: CLAUDE.md(3행)·FACTORY.md는 "완성까지"로 바뀌었는데 하위 파일은 여전히 주말 가정.
- (b) 근거: `lead.md:44` "이게 없으면 **일요일** 배포가 불가능한가?", `lead.md:46` "**주말**에 못 끝낸다는 신호", `reviewer.md:35` "**일요일**이라 급하다", `design/SKILL.md:49` "**주말 MVP**", `shipping/SKILL.md:3,6,88` "**일요일** 배포", `log-decision:18,25,45` "주말 빌드/일요일 회고", `write-post:3,30,48` "**일요일 오후**".
- (c) 어떻게: "일요일 배포 불가능?" → "이번 빌드 출시에 필수인가?", "주말에 못 끝낸다" → "한 빌드에 못 끝낸다", "일요일 오전/오후" → "배포 시점/배포 직후". 의미는 보존하고 시간 축만 제거.
- (d) 효과: CLAUDE.md(L3 "완성까지")와 정합. 데일리/멀티데이 빌드에서도 프롬프트가 자기모순 없이 작동. 모순 제거 = 에이전트 혼란 감소.

**H2. eslint/knip이 이미 강제하는 규칙을 산문에서 "강제됨"으로 강등**

- (a) 무엇: 동일한 숫자 게이트(200줄/40줄/depth3/params3/no-any)가 eslint.config(정본)·conventions·builder·reviewer 4곳에 산문 반복.
- (b) 근거: `eslint.config.mjs:11-28`(error로 강제) vs `conventions:18-21`, `builder.md:21`("파일 200줄, 함수 40줄"), `reviewer.md:22`(체크4 "200줄 초과...3단계 초과"), `reviewer.md:25`(체크8 any/@ts-ignore — eslint error). knip은 `reviewer.md:24`(체크7)에 산문, ci.yml:42·reviewer 절차 3 둘 다 실행.
- (c) 어떻게: reviewer 체크리스트 4·7·8 머리에 "(이미 `pnpm check`/knip이 error로 잡음 — 통과했다면 SKIP, 우회/disable 흔적만 본다)" 한 줄. builder.md:21 길이 규칙은 "(eslint가 막는다)"로 압축. conventions의 숫자는 "eslint.config가 정본"이라고 한 줄.
- (d) 효과: reviewer가 기계가 이미 보장한 것을 수동 재검사하느라 토큰 쓰는 낭비 제거. 사람/에이전트는 기계가 못 잡는 것(명세 일치·스코프·에러 카피)에 집중.

**H3. 더미 env 규칙의 정본 1개화 (현재 3중 기술)**

- (a) 무엇: CI build에 더미 env 필요하다는 동일 규칙이 3곳에 장문 중복.
- (b) 근거: `CLAUDE.md:12`(철칙6, 4줄 장문) + `shipping/SKILL.md:10-25`(§0 전체) + `ci.yml:29-40`(주석). 셋 다 "키 이름 1:1, URL은 URL 형태, 진짜 시크릿은 Vercel" 동일 내용.
- (c) 어떻게: `shipping §0`를 **정본**으로 두고, CLAUDE.md 철칙6을 1줄로 — "env는 모듈 최상위 zod 검증(철칙4). 그래서 **CI build 스텝엔 더미 env 필수**(상세·이유: shipping §0)." ci.yml 주석은 "(왜인지는 shipping §0)"로 축소.
- (d) 효과: 항상 로딩되는 CLAUDE.md에서 ~3줄 절감(매 세션 토큰). 규칙 변경 시 한 곳만 고침(드리프트 방지).

### 중 (MEDIUM)

**M1. 공유 인프라 규칙의 정본 1개화**

- (a) 무엇: Supabase 1개·`프로젝트명_` prefix·Vercel Shared env 규칙이 4곳 분산.
- (b) 근거: `CLAUDE.md:27` + `FACTORY.md:58-60` + `shipping/SKILL.md:27-48`(§0-1, 정본 자격) + `env.ts:6-9` 주석. prefix "위반 불가" 규칙은 shipping에만 상세.
- (c) 어떻게: shipping §0-1을 정본 선언. CLAUDE.md:27·FACTORY.md:58-60은 "(상세: shipping §0-1)" 포인터만. env.ts 주석은 유지(코드 맥락이라 OK).
- (d) 효과: 중복 제거, prefix 규칙 단일 출처.

**M2. lead.md의 가상 예시(`RULES.md`, calculateDeadline)가 전 하네스에 전염**

- (a) 무엇: 특정 도메인(기한계산기) 예시가 일반 템플릿에 박혀 builder·reviewer가 존재하지 않는 `RULES.md`를 참조하게 유도.
- (b) 근거: `lead.md:60`("RULES.md §4"), `lead.md:66-69`(calculateDeadline 통째 예시), `builder.md:16`("RULES.md 등"), `reviewer.md:40`(체크10 "RULES.md 특정 섹션"). 실제 repo에 `RULES.md` 없음(확인함).
- (c) 어떻게: 예시는 유지하되 "예시일 뿐, 실제 참조 문서는 PLAN.md가 지정" 명시. reviewer 체크10은 "PLAN이 참조 문서를 지정했다면"으로 조건화.
- (d) 효과: 에이전트가 없는 파일을 찾는 헛수고 방지, 템플릿 일반성 회복.

**M3. settings.json의 WebFetch deny 정합성**

- (a) 무엇: `WebFetch` deny(L23)인데 lead/reviewer는 tools 화이트리스트라 어차피 불가, builder는 tools 미지정(전체 허용)이라 deny가 실제로 builder만 막음.
- (b) 근거: `settings.json:23`, `lead.md:4`(tools 4개), `reviewer.md:5`(tools 4개), `builder.md`(tools 라인 없음).
- (c) 어떻게: 의도가 "전 에이전트 외부 fetch 금지"면 현행 유지(맞음). 단 의도를 FACTORY.md 품질게이트 근처에 1줄 명시. WebSearch는 deny 안 됨 — 의도면 추가, 비의도면 그대로.
- (d) 효과: 보안 경계 의도 문서화, 추후 혼선 방지.

### 하 (LOW)

**L1. lead.md 슬림화** — 74줄 중 PLAN 형식(L12-40)·범위규칙(L42-47)·명세기준(L55-69)·금지(L49-53)·과잉명세금지(L71-74)가 모두 한 프롬프트. lead 호출 시 전부 로딩. "작업 분해 상세 기준"(L55-69)과 "과잉 명세 금지"(L71-74)는 사실상 같은 주제(무엇 vs 어떻게 경계) → 통합해 ~10줄 절감 가능.

**L2. log-decision 시각 예시 탈주말화** — `:15` `[토 14:20]`, `:18` "주말 빌드". 형식 고정이 핵심이지 요일이 핵심은 아니므로 `[D1 14:20]` 또는 ISO로.

**L3. design/conventions description 길이는 적정** — 조건부 로딩이므로 현재 길이(2~3줄) 문제 없음. 단 description은 "언제 로딩되는가"만 결정하므로, 본문 규칙 요약을 description에 넣지 말 것(현재 안 그럼, 유지).

---

## 3. 중복 매트릭스

| 규칙                                | 등장 위치                                                       | 정본 제안                                                             |
| ----------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------- |
| CI build 더미 env                   | CLAUDE.md:12, shipping §0(10-25), ci.yml:29-40                  | **shipping §0** (CLAUDE 1줄·ci.yml 주석 축약)                         |
| 공유 Supabase + prefix + Shared env | CLAUDE.md:27, FACTORY.md:58-60, shipping §0-1, env.ts:6-9       | **shipping §0-1** (나머지 포인터)                                     |
| 길이 게이트 200/40/depth3/params3   | eslint.config:11-21, conventions:18-21, builder:21, reviewer:22 | **eslint.config.mjs** (산문은 "eslint 강제"로)                        |
| 타입 탈출 any/@ts-ignore/disable    | eslint.config:24, conventions:10, builder:28, reviewer:25       | **eslint.config.mjs** + builder 1줄                                   |
| 죽은 코드 knip                      | ci.yml:42, reviewer 절차3+체크7(24)                             | **ci.yml/CI** (reviewer는 우회 흔적만)                                |
| zod 경계 검증                       | CLAUDE 철칙4, conventions:11, architecture:31, reviewer 체크2   | CLAUDE 철칙4(원칙) + reviewer(검수) — **역할이 달라 허용**(중복 아님) |
| siteUrl/SITE_URL 자동분기           | env.ts:33, shipping:42·54, conventions:13, bootstrap:57         | **env.ts(siteUrl 구현)** + shipping 운영설명 — 역할 분리라 허용       |
| README 센티넬 가드                  | CLAUDE.md:31, README.md:1-3, verify.sh:30, FACTORY.md:36        | **verify.sh(강제) + README(센티넬)** — 일관, 양호                     |

핵심: **상단 3행(더미env·공유인프라·길이게이트)**이 실질 중복. 나머지는 "원칙 선언 vs 검수 vs 구현"으로 역할이 갈려 허용 가능.

---

## 4. 훅 전환 후보 (산문 → 결정론적 강제)

이미 강제 중(참고): 길이·depth·params·no-any(eslint, Stop훅 verify.sh가 `pnpm check`로 실행) / knip(CI) / 위험명령(guard.sh) / 포맷(format.sh) / README 센티넬(verify.sh) / `pnpm check` 통과(verify.sh).

추가 전환 후보:

**HK1. 시크릿/NEXT_PUBLIC 오용 차단 (reviewer 체크6 → PreToolUse 또는 grep 게이트)**

- 현재: `reviewer.md:23` 산문("NEXT*PUBLIC* 오용 포함")으로 사람이 검수.
- 스케치: PostToolUse(Edit|Write) 훅에서 편집된 파일이 `NEXT_PUBLIC_`로 시작하는 env를 `SECRET|KEY|TOKEN|PASSWORD` 패턴과 함께 노출하면 경고. 또는 verify.sh에 `grep -rE 'NEXT_PUBLIC_[A-Z_]*(SECRET|KEY|TOKEN)' src/` 추가해 Stop 차단.
- 한계: 휴리스틱이라 오탐 가능 → 경고(exit 0 + stderr)부터, FAIL은 reviewer가 확정. 트레이드오프: 완전 결정론 아님.

**HK2. 빈 catch / barrel file 금지 (conventions:44, architecture:40 → eslint)**

- 현재: 산문. eslint 규칙으로 강제 가능.
- 스케치: `no-empty`(catch 포함 옵션) 추가, barrel은 `import/no-cycle` 또는 커스텀 — eslint.config에 한 줄씩.
- 효과: reviewer 부담 감소. (단 barrel 자동탐지는 완벽하지 않음 → knip 보완.)

**HK3. `.env` 읽기 차단은 이미 2중** — settings deny(`Read(.env*)`) + guard.sh(cat/grep .env). 양호, 추가 불필요. (이 감사 중 guard.sh가 실제로 내 `.env` 출력 명령을 차단해 동작 검증됨.)

전환 부적합(사람/에이전트 판단 필요, 훅 불가): 스코프 크리프(체크1), 과잉추상화(체크3, "사용처 1곳"은 의미 판단), 에러 카피 한국어(체크5), 명세 일치(체크9·10). 이들은 reviewer의 진짜 가치 영역 → 여기에 reviewer 컨텍스트를 집중시키는 게 H2의 목적.

---

## 5. write-post / blog-style / tistory-post.mjs 유지비 평가

- **사용 빈도**: 빌드당 1회(배포 후), 그것도 블로그 운영 시에만. write-post(104줄)+blog-style(30줄)+tistory-post.mjs(264줄)+post:tistory 스크립트 = 하네스에서 가장 큰 단일 덩어리(~400줄)인데 **핵심 플로우(기획→구현→검수→배포)와 무관**.
- **컨텍스트 비용**: description이 조건부 로딩이라 평소 토큰 비용은 description 2줄뿐 → **상시 비용은 낮다.** 진짜 비용은 (1) tistory DOM 셀렉터 깨짐 유지보수(`tistory-post.mjs:81,108,135` 하드코딩 ID), (2) write-post의 이미지 규칙(L59-81)이 GitHub raw/private 분기까지 22줄 — 과설계 의심.
- **권고(근거 기반)**:
  - **삭제하지 말 것** — `posts/2026-06-why-mvp-factory.md`가 실재하고 README/FACTORY가 블로그 워크플로를 명시(FACTORY 철학). 죽은 스킬 아님.
  - **단, write-post 이미지 섹션(L59-81) 슬림화**: 기본(GitHub raw) 1케이스 + "private면 외부호스트, 안 되면 마커"를 3줄로. 현재 22줄은 description-조건부지만 로딩 시 과함.
  - **tistory-post.mjs는 격리 유지** — eslint.config:57이 scripts/ 길이규칙 면제하므로 게이트 충돌 없음. DOM 깨짐은 스크립트 자체가 "실패 시 클립보드 폴백"(L226)으로 우아하게 처리 → 유지비 통제됨. 양호.
- **결론**: 가치 대비 유지비는 **수용 가능**. 단 write-post 본문 슬림화(L1 등급)만 권고.

---

## 6. 내가 직접 적용하면 좋을 Top 5

1. **H1** — `lead.md:44,46` / `reviewer.md:35` / `shipping:3,6,83,88` / `write-post:3,30,48` / `design:49` / `log-decision:18,25,45`의 "주말·일요일·주차"를 "이번 빌드/배포 시점/한 빌드"로 일괄 치환 (CLAUDE.md 완성까지 프레이밍과 정합).
2. **H3** — `CLAUDE.md:12` 철칙6을 1줄로 줄이고 더미env 상세는 `shipping §0`만 정본으로 (항상 로딩되는 CLAUDE 토큰 절감).
3. **H2** — `reviewer.md` 체크4·7·8 머리에 "(pnpm check/knip이 이미 error로 강제 — 통과 시 SKIP, 우회 흔적만)" 추가 + `builder.md:21` 길이규칙 "(eslint 강제)"로 압축.
4. **M1** — `CLAUDE.md:27`·`FACTORY.md:58-60`을 `shipping §0-1` 포인터로 축약(공유인프라 단일 출처).
5. **M2** — `lead.md:60,66-69` 가상 `RULES.md`/calculateDeadline 예시에 "예시일 뿐, 실제 참조는 PLAN.md가 지정" 명시 + `reviewer.md:40` 체크10 조건화(없는 파일 추적 방지).
