# MVP Factory

배포 가능한 제품 하나를 **상용급 완성도**까지 만든다 — 핵심 기능은 1개로 좁히되 그 1개를 깊게. 시간이 하루가 걸려도 "동작하는 토이"가 아니라 "쓰고 싶은 제품"이 목표다. 이번 빌드의 범위는 PLAN.md가 정의한다. (팩토리 자체 설명은 FACTORY.md, 이 빌드 제품 설명은 README.md)

## 철칙 (위반 불가)

1. PLAN.md에 없는 기능은 만들지 않는다. 필요하면 PLAN.md 수정을 먼저 제안한다.
2. 핵심 기능은 단 1개. 두 번째 기능이 만들고 싶어지면 그건 다음 빌드다. 단, **그 1개는 상용급 깊이**로 만든다 — 엣지케이스·실패경로·상태·차별화 디테일을 PLAN.md '깊이 명세'가 정의한다.
3. 추상화는 같은 패턴이 3번 등장한 뒤에만 한다 (Rule of Three).
4. 모든 외부 입력(폼, API 응답, env)은 경계에서 zod로 검증한다.
5. 의사결정(기술 선택, 트레이드오프)은 즉시 BUILD_LOG.md에 기록한다 (log-decision 스킬 형식).
6. env는 모듈 최상위에서 zod 검증한다(철칙 4). 그래서 **CI의 `pnpm build` 스텝엔 더미 env가 필수**다(키는 env 스키마와 1:1). 이유·방법 상세는 `shipping` 스킬 §0.

## 작업 흐름

- 기획 / 범위 변경 → **lead** 에이전트
- 구현 / 수정 / 테스트 → **builder** 에이전트
- 머지·배포 전 코드 검수 → **reviewer** 에이전트 (FAIL이면 배포 불가, 범위를 잘라서라도 PASS를 만든다)
- 머지·배포 전 UI/UX 검수 → **design-reviewer** 에이전트 (화면이 있는 빌드는 실행+스크린샷 기반 디자인 검수도 PASS해야 배포 가능)

메인 세션은 오케스트레이션만. 무거운 구현 작업은 반드시 서브에이전트에 위임한다. 화면이 있는 빌드의 배포 전 검수는 reviewer(코드) + design-reviewer(UI) **둘 다** 돌린다.

## 상세 규칙 (필요할 때 해당 스킬 참조)

- 폴더 구조·레이어 규칙 → `architecture` 스킬
- 코드 컨벤션 → `conventions` 스킬
- 배포 절차 → `shipping` 스킬
- 공유 인프라(Supabase 1개·테이블 `프로젝트명_` prefix·Vercel Shared env·`scripts/bootstrap.sh`로 자동배포) → `shipping` 스킬 §0-1
- UI/화면 작업 → `design` 스킬 (제품별 고유 아이덴티티 설계 프로세스: 무드보드→팔레트→토큰→빌드 + 상용급 폴리시. 레퍼런스는 `design/references.md`). **컴포넌트 만들기 전에 Phase 0~2 필수.**
- 의사결정 기록 → `log-decision` 스킬
- 빌드 후 블로그 글 → `write-post` 스킬 (+ `blog-style` 문체)
- 제품 README → PLAN 확정 후 `README.md`를 이 제품 설명으로 교체하고 상단 `mvp-factory:README-TODO` 센티넬을 지운다. 미작성 시 Stop 훅(verify)이 종료를 막는다. 팩토리 설명은 건드리지 말 것(FACTORY.md).
- 디자인 아이덴티티 → `DESIGN.md`(무드보드·형용사 3개·팔레트)를 작성하고 `globals.css`의 기본 토큰을 이 제품 토큰으로 교체 후 `mvp-factory:DEFAULT-TOKENS` 센티넬을 지운다. 미작성 시 Stop 훅이 종료를 막는다.

## 명령어

- `pnpm dev` — 개발 서버
- `pnpm check` — lint + typecheck + test (이게 통과해야 작업 완료로 간주)
- `pnpm e2e` — 스모크 테스트 (있는 경우)
