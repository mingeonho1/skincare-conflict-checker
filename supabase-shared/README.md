# 공유 Supabase + 환경변수 운영 (mvp-factory가 관리)

모든 제품(이 팩토리로 찍어낸 레포들)은 **Supabase 프로젝트 1개**를 공유한다. 그 공유 인프라의 **단일 원본은 이 디렉토리(`mvp-factory/supabase-shared/`)이고, 기준은 항상 GitHub origin이다.**

> 실행 환경(컴퓨터)은 매일 바뀔 수 있다. 그래서 떠돌이 로컬 폴더가 아니라 mvp-factory 레포 안에서 버전 관리하고, 적용·수정은 **origin에서 clone/pull → 변경 → push** 사이클로 한다. 로컬 절대경로에 의존하는 지시는 두지 않는다.

## 1. 테이블 소유 맵

| 제품            | 테이블 / 자원                                                                                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| (공유)          | `waitlist` — 전 제품 공유, `source` 컬럼으로 구분                                                                                             |
| career-vault    | `career_vault_documents`, `career_vault_career_cards`, `career_vault_feature_interest`, storage 버킷 `career-vault-certificates`, (Auth 사용) |
| patent-deadline | 공유 `waitlist` (source='patent-deadline')만                                                                                                  |
| the-counter     | `the_counter_counter`, `the_counter_entries`, RPC `the_counter_claim_next_number`                                                             |
| the-rgb         | `the_rgb_colors`                                                                                                                              |
| the-3-letters   | `the_3_letters_codes`                                                                                                                         |

**네임스페이싱 규칙**

- 제품 고유 테이블/RPC = `프로젝트명_이름` (언더스코어).
- `waitlist`는 본질이 `email + 어느 제품`이라 공유 1개 + `source` 컬럼. 새 제품 대기명단도 `source='<제품>'`으로 같은 테이블에 → 새 테이블 불필요.
- storage 버킷/정책은 `storage.objects`(전역 테이블) 공유 → 버킷 id·정책명에 반드시 prefix.

## 2. 스키마 적용 / 갱신 (origin 기준)

**적용**: mvp-factory를 origin에서 clone/pull → 공유 Supabase 프로젝트 SQL Editor에 `supabase-shared/schema.sql` 전체 붙여넣기 → Run. 전부 idempotent라 재실행 안전.

**새 제품 추가 시**: 그 제품의 prefix DDL을 `schema.sql`에 합치고 **mvp-factory를 commit & push**(origin이 단일 원본). 그 뒤 아무 머신에서나 pull → Run 하면 최신 스키마가 적용된다.

## 3. env 공유 — 한 번 설정하면 전 레포 공유

핵심: **CI는 진짜 시크릿이 필요 없다**(`ci.yml`의 더미 env로 빌드 검증). 진짜 시크릿은 **Vercel(배포)에만** 둔다 → "레포마다 GitHub Secret" 작업 자체가 불필요.

### (A) Vercel — Shared Environment Variables (팀 레벨) ✅

Vercel Team Settings → Environment Variables → _Shared_ 에 **한 번만** 등록하고, 새 프로젝트는 연결(Link)만:

- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`
- `GEMINI_API_KEY` (career-vault 등 필요한 제품만 연결)

→ 시크릿 회전도 팀에서 한 번 바꾸면 전 프로젝트 반영.

### (B) SITE_URL — 설정하지 마라 (자동 분기)

각 레포 `src/lib/env.ts`의 `siteUrl()`가: SITE_URL 있으면 그것(커스텀 도메인) → 없으면 Vercel 자동 주입 `VERCEL_PROJECT_PRODUCTION_URL` → 로컬은 `http://localhost:3000`. 커스텀 도메인 붙인 제품만 그 프로젝트에 `SITE_URL` 추가.

### (C) GitHub Actions — 공유할 것 없음

`ci.yml` 더미 env로 빌드. 레포마다 Secret 불필요. (CI에서 실 DB 통합테스트를 원하면 그때만 GitHub **Organization Secrets** 1회 등록 → 전 레포 자동 상속.)

## 4. env 키 요약

| 키                         | 누가 쓰나                                         | Vercel Shared        |
| -------------------------- | ------------------------------------------------- | -------------------- |
| `SUPABASE_URL`             | 전부                                              | ✅                   |
| `SUPABASE_SECRET_KEY`      | 전부                                              | ✅                   |
| `SUPABASE_PUBLISHABLE_KEY` | career-vault, the-counter, the-rgb, the-3-letters | ✅                   |
| `GEMINI_API_KEY`           | career-vault                                      | ✅ (해당 프로젝트만) |
| `SITE_URL`                 | (옵션) 커스텀 도메인 제품만                       | ❌ 프로젝트별        |

> patent-deadline은 `SUPABASE_URL` + `SUPABASE_SECRET_KEY`만.

## 5. 주의

- **Supabase Auth는 프로젝트 전역 공유**. 현재 Auth 사용은 career-vault뿐. 다른 제품이 Auth 도입 시 user 풀 공유(구분 필요하면 user metadata에 `product` 태그).
- secret key는 RLS bypass → 서버(server action/route)에서만, 클라이언트 번들 노출 금지(각 레포 `db.ts`는 `server-only`).
