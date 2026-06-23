---
name: shipping
description: 배포 절차와 출시 체크리스트. 배포 작업, Vercel 배포, 도메인 연결, 계측 설정 시 참조한다.
---

# 배포 절차 (reviewer SHIP IT 직후)

전제: reviewer가 `SHIP IT`을 반환한 상태. FAIL이 남아 있으면 이 스킬을 진행하지 않는다.

## 0. CI에서 `pnpm build`는 더미 env가 필요하다 (반복 함정)

`next build`는 "collecting page data" 단계에서 **서버 모듈을 import-time에 평가**한다. env를 모듈 최상위에서 검증하고(`src/lib/env.ts`의 `parse(process.env)`) SDK 클라이언트도 모듈 최상위에서 인스턴스화하면(`new GoogleGenAI({ apiKey: env.X })` 등), **env가 없는 CI 환경에서 `pnpm build`는 ZodError로 실패한다.** lint/typecheck/test는 env가 필요 없어 통과하므로 build 스텝에서만 터진다.

규칙: CI 워크플로의 **build 스텝에만** 형태만 맞는 더미 env를 준다 (URL 필드는 URL 형태). 키 이름은 `src/lib/env.ts` 스키마와 1:1. 진짜 시크릿은 배포 플랫폼(Vercel)에서 주입하고, 그쪽 빌드는 실제 env로 검증되므로 prod env 누락 시 배포 빌드가 실패한다(fail-fast 유지). `.github/workflows/ci.yml`:

```yaml
- name: Build
  run: pnpm build
  env:
    SUPABASE_URL: https://placeholder.supabase.co
    SUPABASE_PUBLISHABLE_KEY: ci-placeholder
    # ...나머지 키도 더미 값. 키 이름은 src/lib/env.ts 스키마와 1:1로 맞춘다
```

대안(택1): env를 lazy 검증으로 바꾸고 SDK 클라이언트를 함수 안에서 생성하면 CI/로컬 빌드가 env를 아예 안 본다 — 단 Vercel 빌드도 env 검증을 건너뛰어 누락이 첫 요청 때 터지므로 fail-fast가 약해진다. 배포 시점 차단을 원하면 더미 env 방식을 쓴다.

## 0-1. 공유 인프라 — Supabase 1개 + Vercel Shared env (모든 빌드 공통)

이 팩토리의 모든 제품은 **Supabase 프로젝트 1개를 공유**하고, env도 **한 번만 설정해서 전 레포가 공유**한다. 새 빌드마다 인프라를 새로 파지 않는다.

**테이블 네임스페이싱 (충돌 방지, 위반 불가)**

- 제품 고유 테이블/RPC = `프로젝트명_이름` (언더스코어). 예: `the_rgb_colors`, `the_counter_claim_next_number`.
- `waitlist`처럼 본질이 범용인 것(이메일 + 어느 제품)은 **공유 1개 테이블 + `source` 컬럼**으로 제품을 구분한다(새 테이블 금지). `unique (email, source)`.
- storage 버킷·버킷 정책은 `storage.objects`라는 **전역 테이블**을 공유하므로 버킷 id·정책명에 반드시 `프로젝트명-` prefix.
- 새 빌드의 마이그레이션은 prefix 이름으로 작성하고, **mvp-factory의 `supabase-shared/schema.sql`(GitHub origin이 단일 원본)에 합쳐 push**한 뒤, origin에서 pull한 그 파일을 Supabase SQL Editor에 Run한다. 전부 `if not exists`로 idempotent하게. (로컬 사본이 아니라 origin 기준 — 실행 머신은 매일 바뀔 수 있다.)

**env 공유 (Vercel Shared Environment Variables)**

- CI는 진짜 시크릿이 필요 없다(§0의 더미 env). 진짜 시크릿은 **Vercel에만** 둔다.
- `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_SECRET_KEY` (+ 빌드별 `GEMINI_API_KEY` 등)를 **Vercel 팀 Settings → Environment Variables → Shared 에 1회 등록**. 새 프로젝트는 import 시 이 Shared 변수를 **연결(Link)만** 하면 된다. 시크릿 회전도 한 곳에서.
- `SITE_URL`은 **설정하지 않는다.** `src/lib/env.ts`의 `siteUrl()` 헬퍼가 로컬→`localhost:3000`, 배포→Vercel 자동 주입 `VERCEL_PROJECT_PRODUCTION_URL`로 분기한다. 커스텀 도메인 붙인 제품만 그 프로젝트에 `SITE_URL` 하나 추가.

**자동 배포 — 한 번 연결하면 push마다 자동**

- Vercel은 GitHub 레포를 한 번 import/연결하면, 이후 **`main`에 push할 때마다 자동으로 프로덕션 배포**(다른 브랜치·PR은 프리뷰 배포). 매번 수동 배포 안 한다.
- 새 레포 셋업은 `scripts/bootstrap.sh` 한 줄로: git init+커밋 → `gh repo create`+push → `vercel link`+`vercel git connect`(자동배포 연결)+첫 배포. 사전에 `gh auth login`, `vercel login` 1회.
- bootstrap 후 **사람이 하는 1회 작업**: ① Vercel 프로젝트에 Shared env 연결(연결 후 1회 재배포) ② 새 테이블 있으면 `schema.sql` Run ③ (Auth 쓰면) Supabase Auth URL 설정. 스크립트가 끝에 이 목록을 출력한다.

## 1. 배포 전 점검

- [ ] `pnpm check` 통과 (로컬 최종 확인)
- [ ] `pnpm build` 로컬 성공 — 빌드 타임 에러는 로컬에서 잡는다
- [ ] env 점검: 공유 SUPABASE*\* 가 이 Vercel 프로젝트에 Shared로 연결됐는가(§0-1). `SITE_URL`은 커스텀 도메인 쓸 때만. `NEXT_PUBLIC*` 접두사가 붙은 값 중 비밀이어야 하는 게 없는가
- [ ] 테이블/RPC/버킷이 `프로젝트명_` prefix로 네임스페이싱됐는가(공유 DB 충돌 방지, §0-1)
- [ ] Supabase: RLS가 모든 테이블에 켜져 있는가 (꺼진 테이블 = 공개 테이블)

## 1-1. Supabase Auth (매직링크·OAuth 쓰는 빌드의 필수 대시보드 설정)

코드만 맞아도 대시보드 설정이 빠지면 로그인이 통째로 깨진다. 대시보드는 코드로 못 고치니 배포 전 직접 한다.

- [ ] **URL Configuration → Site URL** = 프로덕션 도메인 (`https://...`). 기본값이 `http://localhost:3000`이라, 안 바꾸면 매직링크가 localhost로 폴백한다. (이건 **Supabase 대시보드 설정**으로, 앱 코드의 `siteUrl()`/`SITE_URL` env와는 별개다 — 공유 Supabase라 Auth 쓰는 제품의 프로덕션 도메인을 여기 등록.)
- [ ] **URL Configuration → Redirect URLs** 허용목록에 프로덕션·로컬 콜백 둘 다 추가: `https://<도메인>/**`, `http://localhost:3000/**`. 허용목록에 없으면 우리가 보낸 `emailRedirectTo`가 무시되고 Site URL로 폴백된다(증상: 링크가 `/auth/callback`이 아닌 루트 `/?code=`로 떨어짐).
- [ ] **커스텀 SMTP** (Resend·SendGrid 등): 기본 메일은 시간당 2~3통 rate limit + "프로덕션용 아님"이고 발신 주소가 `noreply@mail.app.supabase.io`다. **이메일 발송 한도(Auth → Rate Limits)는 커스텀 SMTP를 켜야만 올릴 수 있다** — 내장 메일러로는 한도가 잠겨 있어 테스트 몇 번이면 429가 난다. 가입 수를 지표로 삼는 빌드는 사실상 필수.
- [ ] **Auth 메일 템플릿 브랜딩**: 기본 영문 템플릿은 어느 서비스인지 식별이 안 된다. 제품명 + 해요체 + design 스킬 색 토큰으로 교체한다 (템플릿 파일은 `supabase/email-templates/`에 두고 대시보드에 수동 적용).

## 2. 배포

1. 최초 1회만 `scripts/bootstrap.sh`로 GitHub+Vercel 연결(§0-1). 그 뒤로는 **`git push origin main` 하면 Vercel이 자동 배포**한다 — 수동 배포 불필요
2. 배포 URL에서 스모크 테스트 — 사용자 여정 그대로 1회: 랜딩 진입 → 핵심 기능 1회 실행 → 결제/대기명단 제출 → 성공 화면 확인
3. 모바일 뷰포트 1회 확인 (트래픽 대부분은 모바일에서 온다)

## 3. 출시 마감재

- [ ] 메타: title, description, OG 이미지 1장 (og:image 1200x630 — 스크린샷에 제품명 얹은 정도면 충분)
- [ ] favicon
- [ ] 404 페이지에 홈 복귀 링크
- [ ] 계측: Vercel Analytics 또는 Plausible 활성화 + 핵심 이벤트 3개만 (방문은 기본 수집, `signup_submitted`, `payment_completed` 커스텀 이벤트)

## 4. 배포 직후

- [ ] BUILD_LOG.md에 배포 시각, 프로덕션 URL, 이번 빌드의 성공 지표(PLAN.md에 정의한 것) 기록
- [ ] (블로그/포트폴리오 등 빌드 목록을 둔다면) 제품명 | URL | 검증 지표 | 결과(추후 기입) 한 줄 추가
- [ ] `write-post` 스킬로 블로그 글 생성 단계로 이동

## 금지

- 배포 시점에 새 기능 추가 (배포일은 마감일이다. 발견된 개선점은 Backlog로)
- 스모크 테스트 생략 ("로컬에서 됐으니까"는 사고의 전조)
- 계측 없는 배포 (지표 없는 빌드는 검증이 아니라 취미다 — 킬 규칙을 적용할 데이터가 없어진다)
