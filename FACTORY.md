# MVP Factory (빌드 하네스)

배포 가능한 제품 하나를 **상용급 완성도**로 **기획 → 구현 → 검수(코드+UI) → 배포**까지 끌고 가는 에이전트 하네스 템플릿. 핵심 기능은 1개로 좁히되 깊게, 화면은 제품별 고유 아이덴티티로 — "동작하는 토이"가 아니라 "쓰고 싶은 제품"을 만든다.
이 문서는 팩토리 자체 설명이다. 각 빌드의 제품 설명은 그 레포의 `README.md`에 쓴다.

## 작업 흐름

새 빌드 디렉토리(이 템플릿 복제본)에서 Claude Code를 켜고, 한 줄 아이디어를 주면 완성까지 진행된다.

```bash
pnpm install
claude
```

첫 프롬프트 예: `lead로 이번 빌드 PLAN.md 만들어줘. 아이디어: <한 줄>. 완성까지 목표.`

그 뒤는 터미널만 켜두면 된다 — 메인 세션이 오케스트레이션하고, 무거운 작업은 서브에이전트(lead/builder/reviewer)에 위임되어 `pnpm check`가 통과하는 완성 상태까지 간다.

## 새 컴퓨터에서 새 제품 찍어내기 (그대로 따라하기)

> 실행 머신은 매일 바뀔 수 있다. 모든 기준은 **GitHub origin**이다 — 로컬에 뭐가 있다고 가정하지 않는다.

### 0. 새 컴퓨터 1회 셋업

```bash
# Claude Code 설치(claude.ai/code) + Node 22+ + pnpm + git
brew install gh                 # GitHub CLI
npm i -g vercel                 # Vercel CLI
gh auth login                   # GitHub 로그인
vercel login                    # Vercel 로그인
```

- (영구·1회) Vercel **Team Settings → Environment Variables → Shared** 에 공유 Supabase 값 등록:
  `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_SECRET_KEY` (+ 필요 제품만 `GEMINI_API_KEY`).
  값 출처: 공유 Supabase 프로젝트 → Settings → API.
- 공유 DB가 아직 비어 있으면, mvp-factory를 받아 스키마를 한 번 적용:
  ```bash
  gh repo clone <owner>/mvp-factory && cd mvp-factory
  # supabase-shared/schema.sql 전체를 공유 Supabase SQL Editor에 붙여넣고 Run
  ```

### 1. 새 제품 레포 생성 (템플릿 → origin)

```bash
gh repo create <product-name> --template <owner>/mvp-factory --public --clone
cd <product-name>
pnpm install
```

### 2. Claude로 완성까지 (켜두면 자동)

```bash
claude
```

첫 프롬프트(이대로 입력):

```
lead로 PLAN.md 만들어줘. 아이디어: <한 줄 아이디어>. 완성까지가 목표야. 끝까지 자동으로 진행해.
```

→ lead가 PLAN.md(깊이 명세 포함) → builder가 design 스킬로 고유 아이덴티티 설계 후 구현 → reviewer(코드)+design-reviewer(UI) 검수 → (FAIL이면) 수정 → `pnpm check`/`pnpm build` green + **제품 README·DESIGN.md 작성**(Stop 훅이 강제) + 커밋까지 자율 진행. 터미널만 켜두면 된다.

### 3. GitHub + Vercel 연결 + 배포

```bash
bash scripts/bootstrap.sh
```

그다음 **1회 수동**(대시보드): Vercel → 이 프로젝트 → Settings → Environment Variables → 팀 Shared(SUPABASE\_\*) **연결(Link)** → 한 번 **Redeploy**. 이후로는 `git push`마다 자동 배포된다.

### 4. 공유 DB 스키마 (새 테이블을 추가한 빌드만)

- 이 제품의 prefix 테이블 DDL을 mvp-factory의 `supabase-shared/schema.sql`에 합쳐 **commit & push**(origin이 단일 원본).
- 그 파일을 공유 Supabase SQL Editor에 Run.
- (Auth 쓰는 빌드만) Supabase → Auth → URL Configuration에 이 제품의 프로덕션 도메인 등록.

### 5. 블로그 글 (선택, 배포 후)

```bash
claude
```

```
/write-post
```

→ `posts/<날짜>-<제품>.md` 완성본 생성. 스크린샷은 `posts/screenshots/`에 두고 **commit & push**(본문이 GitHub raw URL로 임베드됨). 발행:

```bash
pnpm exec playwright install chromium      # 최초 1회
pnpm post:tistory posts/<날짜>-<제품>.md
```

열린 브라우저에서 (최초) 로그인 → 자동 입력 → 마지막 **[공개 발행]만 직접 클릭**.

## 철학

- **에이전트 분리**: 기획(lead) / 구현(builder) / 코드검수(reviewer) / UI검수(design-reviewer)를 분리. 기획자가 자기 결과를 검수하면 같은 맹점을 두 번 통과하므로, 검수는 깨끗한 컨텍스트가 맡는다. 코드 정합성과 시각 완성도는 보는 눈이 달라 검수자도 나눈다.
- **상용급 = 깊이 + 아이덴티티**: 조잡함의 원인은 ① 기능이 얕고(엣지케이스·상태·디테일 부재) ② 모든 제품이 같은 기본 토큰을 써서 "다 비슷해" 보이는 것. 그래서 lead는 PLAN에 '깊이 명세'를, builder는 제품별 고유 디자인 아이덴티티(무드보드→토큰)를 의무로 만든다.
- **규칙은 훅으로 강제**: 프롬프트는 해석에 의존하지만 훅은 결정론적이다. 포맷팅·위험 명령 차단·품질 게이트·README 가드는 훅이 처리한다.
- **컨텍스트 경제**: `CLAUDE.md`는 철칙과 포인터만(항상 로딩). 상세 규칙은 스킬로 분리해 관련 작업 때만 조건부 로딩. 무거운 구현 로그는 서브에이전트 격리 컨텍스트에서 소각.

## 구조

| 경로                   | 역할                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `CLAUDE.md`            | 철칙 + 포인터 (항상 로딩)                                                                            |
| `README.md`            | **이 빌드 제품**의 설명 (빌드마다 교체)                                                              |
| `FACTORY.md`           | 팩토리(하네스) 자체 설명 — 이 문서                                                                   |
| `PLAN.md`              | 이번 빌드의 범위 (lead가 생성)                                                                       |
| `BUILD_LOG.md`         | 의사결정/삽질 로그                                                                                   |
| `.claude/agents/`      | lead · builder · reviewer · design-reviewer                                                          |
| `.claude/skills/`      | architecture · conventions · shipping · design(+references) · log-decision · write-post · blog-style |
| `DESIGN.md`            | **이 빌드 제품**의 디자인 아이덴티티(무드보드·형용사·팔레트) — 빌드마다 작성, Stop 훅 강제           |
| `.claude/hooks/`       | guard(위험 명령 차단) · format(자동 포맷) · verify(Stop 시 품질 게이트 + README·디자인 가드)         |
| `scripts/bootstrap.sh` | 새 레포를 GitHub+Vercel에 연결, 이후 push마다 자동 배포                                              |

## 명령어

| 명령                        | 용도                                                          |
| --------------------------- | ------------------------------------------------------------- |
| `pnpm dev`                  | 개발 서버                                                     |
| `pnpm check`                | lint + typecheck + test — 통과해야 작업 완료 (Stop 훅이 강제) |
| `pnpm build`                | 프로덕션 빌드 (배포 전 빌드 타임 에러 확인)                   |
| `pnpm e2e`                  | 스모크 테스트 (있는 경우)                                     |
| `pnpm knip`                 | 미사용 export/파일/의존성 탐지                                |
| `bash scripts/bootstrap.sh` | GitHub+Vercel 연결 (최초 1회)                                 |

> `git push`·`.env` 읽기·`rm -rf` 등 되돌리기 어려운 명령은 guard 훅이 차단한다.

## 품질 게이트 (4중)

1. 스킬 — 에이전트가 컨벤션/아키텍처/디자인 규칙 참조 (design 스킬은 컴포넌트 전 무드보드→토큰 강제)
2. 검수 에이전트 — reviewer(코드 정합성) + design-reviewer(실행+스크린샷 기반 UI 완성도). 화면 빌드는 둘 다 PASS해야 배포
3. 훅 — Stop 시 `pnpm check` 실패 / 제품 README 미작성 / DESIGN.md 부재 / globals.css가 팩토리 기본 토큰이면 종료 차단
4. CI — push마다 lint + typecheck + test + build + knip

## 공유 인프라

모든 제품은 Supabase 프로젝트 1개를 공유한다(테이블 `프로젝트명_` prefix, `waitlist`는 공유+source). env는 Vercel 팀 Shared로 1회 등록. 공유 DB의 단일 원본은 이 레포의 **`supabase-shared/`**(schema.sql + 운영 가이드)이며 **GitHub origin 기준**으로 관리한다(실행 머신이 매일 바뀔 수 있으므로). 상세는 `shipping` 스킬 §0-1.
