import { z } from "zod";

/**
 * env는 여기서 한 번만 검증한다. 다른 모듈은 process.env 대신 이 모듈을 import.
 * 빌드별로 필요한 키를 스키마에 추가할 것 (예: SUPABASE_*).
 *
 * 공유 인프라 규칙(shipping 스킬 참조):
 *  - SUPABASE_* 는 Vercel 팀 Shared env로 한 번만 등록 → 새 프로젝트마다 연결만.
 *  - SITE_URL 은 optional. 직접 쓰지 말고 아래 siteUrl()을 써라(로컬/배포 자동 분기).
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Supabase는 익명 검사 로깅(계측) 전용이라 optional이다. 미설정이면 db가 null이고
  // logCheck가 조용히 no-op한다 — 핵심 기능은 Supabase 없이 100% 동작한다(PLAN: 로깅은 선택).
  // 키를 Vercel에 추가하면 로깅이 자동 활성화된다.
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),

  // 절대 URL. 비워두면 siteUrl()이 자동 분기하므로 optional.
  SITE_URL: z.string().url().optional(),

  // Gemini API. 없으면 LLM 추출을 건너뛰고 키워드 폴백으로 동작한다.
  GEMINI_API_KEY: z.string().min(1).optional(),
});

export const env = envSchema.parse(process.env);

/**
 * 절대 URL이 필요할 때(OG metadataBase, 이메일 redirect 등) 쓴다. 로컬/배포 자동 분기:
 *  - SITE_URL이 명시돼 있으면 그것(커스텀 도메인용)
 *  - Vercel 배포면 프로젝트별 자동 주입값(VERCEL_PROJECT_PRODUCTION_URL)
 *  - 그 외(로컬)면 localhost
 */
export function siteUrl(): string {
  if (env.SITE_URL) return env.SITE_URL;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
