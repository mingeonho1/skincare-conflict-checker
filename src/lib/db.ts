import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// Supabase는 익명 로깅 전용 — 키가 없으면 null. 소비처(queries)는 null을 guard한다.
export const db =
  env.SUPABASE_URL && env.SUPABASE_SECRET_KEY
    ? createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY)
    : null;
