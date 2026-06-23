# Build Log — 같이써도돼? (스킨케어 성분 충돌 체커)

## Decisions

### [D1 12:00] 충돌 판정을 규칙 엔진으로 완전 분리, LLM은 추출+윤문만

- 선택: 결정론적 규칙 테이블(data.ts) + zod 검증이 유일한 충돌 판정 진실의 원천
- 대안: LLM에 충돌 여부도 위임
- 이유: LLM은 안전 정보를 환각함. 이번 타겟(스킨케어 입문자)에게 잘못된 경고/안심은 신뢰 손상이 치명적
- 트레이드오프: 규칙 확장에 코드 수정 필요. 단 MVP 10종 사전으로 충분

### [D1 12:10 → D2 갱신] @google/genai SDK + Gemini 3.1 Flash-Lite 모델

- 선택: `@google/genai`(신규 통합 SDK) + `gemini-3.1-flash-lite`(GA 2026-05-07)
- 대안: 레거시 `@google/generative-ai` + `gemini-2.0-flash`(초기 구현), REST 직접 호출, Vercel AI SDK
- 이유: 공식 문서 확인 결과 `@google/generative-ai`는 레거시이고 Gemini 3.x는 신규 `@google/genai` SDK가 필요. 모델은 저지연·저비용 용도(추출/윤문)에 맞는 최신 안정판 Flash-Lite. preview(`-preview`)는 2026-07-09 종료 예정이라 GA ID 사용
- 트레이드오프: SDK 호출부 변경(`getGenerativeModel().generateContent()` → `ai.models.generateContent({model, contents})`, 응답은 `.text`). 벤더 종속은 타임아웃+폴백으로 LLM 의존도를 0에 가깝게 유지
- 빌드 메모: pnpm 11은 빌드 스크립트 승인을 `pnpm-workspace.yaml`의 `allowBuilds`에서 읽음. `@google/genai`·`protobufjs`는 런타임 빌드 불필요라 `false`로 결정

### [D1 12:15] GEMINI_API_KEY를 zod optional로 — 폴백 분기 (throw 금지)

- 선택: `z.string().min(1).optional()` — 미설정 시 `undefined`, 즉시 폴백
- 대안: required로 하고 키 없으면 빌드 실패
- 이유: 이번 범위에서 LLM은 정확도 향상 레이어일 뿐, 핵심 기능은 키 없이도 100% 작동해야 함
- 트레이드오프: 없음 — 이 트레이드오프 자체가 아키텍처 원칙

### [D1 12:20] 충돌 규칙·성분 사전을 코드 정적 데이터로 (DB 아님)

- 선택: `actives-data.ts` + `rules-data.ts` → `data.ts`에서 zod 검증 후 export
- 대안: Supabase 테이블에서 런타임 fetch
- 이유: 이번 범위에서 규칙은 코드 변경과 함께 배포되는 정적 지식. DB fetch는 레이턴시·실패경로·캐시 문제를 추가
- 트레이드오프: 규칙 추가·수정에 배포 필요. MVP 규모에서 무의미한 우려

### [D1 12:25] @supabase/supabase-js 설치 — 계측 로깅용

- 선택: `@supabase/supabase-js` 공식 클라이언트
- 대안: REST API 직접 호출
- 이유: 이미 공유 Supabase 인프라가 있고, 팩토리 표준 스택. 로깅 실패는 삼켜 결과 흐름을 막지 않음
- 트레이드오프: 없음

### [D1 12:30] Tailwind v4 커스텀 토큰 — CSS var() 직접 참조

- 선택: `style={{ color: "var(--color-ink)" }}` + `bg-[var(--color-primary)]` 조합
- 대안: tailwind.config.ts에 colors 확장
- 이유: Tailwind v4는 `@theme`에 CSS 변수만 정의하면 되고, arbitrary value로 참조 가능. config 파일 없이도 동작
- 트레이드오프: 클래스가 약간 장황해짐. 단 인라인 스타일과 병용으로 가독성 유지

### [D1 12:35] 브랜드 컬러를 스틸 블루-그레이(#4F7A9B)로

- 선택: 뮤트된 스틸 블루-그레이. 차갑지 않고 신뢰감 있는 중간 톤
- 대안: 흔한 Toss 파랑(#3182F6), 그린 SaaS 색
- 이유: 시맨틱 컬러(경고=레드, 안심=그린, 팁=옐로우)가 정보 축이므로 브랜드가 이 셋과 충돌하면 안 됨. 블루 계열이 의료/신뢰 도메인에 적합하면서 Toss 파랑과도 구별됨
- 트레이드오프: 없음 — DESIGN.md §Phase 1에 근거 기록

### [D6] Gemini Vision 모델 — gemini-2.5-flash (VISION_MODEL 상수 분리)

- 선택: OCR 전용으로 `VISION_MODEL = "gemini-2.5-flash"` 상수 분리, 기존 텍스트 모델(`MODEL = "gemini-3.1-flash-lite"`)과 병행
- 이유: `gemini-3.1-flash-lite`는 텍스트 전용 모델 — 이미지 인라인 데이터(`inlineData`) 파트를 지원하지 않음. `gemini-2.5-flash`는 멀티모달 GA 모델로 Vision 입력 공식 지원
- 대안: `gemini-2.0-flash`(이전 멀티모달), `gemini-1.5-pro`
- 트레이드오프: 모델 두 개 관리. 단 OCR은 키가 있을 때만 호출되고 텍스트 추출/윤문 경로와 격리되어 상호 영향 없음

## Stuck & Solved

## Backlog

- e2e 스모크 테스트(Playwright): `pnpm e2e` 스크립트 및 `e2e/check.spec.ts` — happy path + 액티브 미감지 케이스. PLAN.md에 명시돼 있으나 이번 빌드에서 Playwright 설치·실행환경 확보가 별도 작업. 테스트 구조만 마련해도 됨.
- 성분 사전 확장: PHAs(폴리하이드록시산), 트레티노인 등 처방 레티노이드, 아이소트레티노인 등 10종 → 20종으로 확장 가능
- 결과 공유: URL 파라미터에 base64 직렬화로 결과 링크 공유 (로그인 불필요). v1 Non-goal이나 v2 후보
- 단일 제품 내 다중 액티브 충돌도 안내하는 UI 개선 (현재 엔진은 판정하나 UI 강조가 부족)
- 모바일에서 textarea가 충분히 크게 보이는지 실기기 검증 필요

## Ship

- 배포일: 2026-06-19
- 프로덕션 URL: https://skincare-conflict-checker.vercel.app
- 스모크: HTTP 200, 랜딩 핵심 카피("같이 발라도 되는지"·"충돌 검사") 렌더 확인
- 자동배포: GitHub `main` push → Vercel 자동 프로덕션 배포 연결됨
- env 상태: 시크릿 없이 배포(Supabase optional → 로깅 비활성, Gemini optional → 키워드 폴백). 키 추가 시 자동 활성화
- 성공 지표(PLAN): 검사 완료율 — Supabase 로깅 활성화 후 수집 시작

## Retro
