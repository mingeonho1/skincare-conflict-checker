-- ============================================================
-- 공유 Supabase 스키마 — 한 프로젝트에 모든 제품을 담는다
-- ============================================================
-- 사용법: 공유 Supabase 프로젝트의 SQL Editor에 이 파일 전체를 붙여넣고 1회 실행.
-- 모든 문장이 `if not exists` / `on conflict do nothing` / `or replace`라 재실행해도 안전(idempotent).
--
-- 네임스페이싱 규칙:
--   - 제품 고유 테이블/RPC = 프로젝트명_이름  (예: the_rgb_colors)
--   - waitlist = 전 제품 공유 1개 테이블 + source 컬럼으로 제품 구분 (domain type)
--   - storage 버킷/정책 = 전역 자원이라 반드시 프로젝트 prefix (career-vault-certificates)
--
-- 이 파일은 mvp-factory 레포에서 관리하는 공유 DB의 단일 원본이다(GitHub origin 기준).
-- 실행 환경(컴퓨터)은 매일 바뀔 수 있으니, 적용할 땐 로컬 사본이 아니라 mvp-factory를 origin에서
-- clone/pull 한 뒤 이 파일을 Supabase SQL Editor에 Run한다.
-- 새 제품을 추가하면 그 제품의 prefix DDL을 이 파일에 합치고 mvp-factory를 push해 origin을 갱신한다.
-- (각 제품 레포의 supabase/migrations/*.sql 는 그 제품의 로컬 참조본.)
-- ============================================================


-- ============================================================
-- [공유] waitlist — 모든 제품이 공유. source 컬럼으로 제품 구분.
-- 새 제품의 대기명단도 이 테이블에 source='<제품>' 으로 들어간다 (새 테이블 불필요).
-- ============================================================
create table if not exists public.waitlist (
  id         bigint generated always as identity primary key,
  email      text not null,
  source     text not null,                       -- 어느 제품에서 등록했는지 (예: 'career-vault')
  created_at timestamptz not null default now(),
  unique (email, source)                          -- 같은 이메일이 여러 제품에 가입 가능
);
create index if not exists waitlist_source_idx on public.waitlist (source);
alter table public.waitlist enable row level security;

-- 익명 포함 누구나 insert 가능 (대기명단 등록). secret key 클라이언트는 RLS를 bypass.
create policy "waitlist: anon insert"
  on public.waitlist for insert
  with check (true);
-- select는 서버(secret key)에서만 — anon 직접 조회 차단.
create policy "waitlist: no anon select"
  on public.waitlist for select
  using (false);


-- ============================================================
-- [career-vault] 제품 고유 테이블 (career_vault_*) + storage 버킷
-- ============================================================
create table if not exists public.career_vault_documents (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  storage_path    text not null,
  file_name       text not null,
  mime_type       text not null,
  size_bytes      bigint not null,
  status          text not null default 'uploaded'
                    check (status in ('uploaded', 'extracted', 'failed')),
  created_at      timestamptz not null default now()
);
alter table public.career_vault_documents enable row level security;
create policy "career_vault_documents: owner select" on public.career_vault_documents for select using (user_id = auth.uid());
create policy "career_vault_documents: owner insert" on public.career_vault_documents for insert with check (user_id = auth.uid());
create policy "career_vault_documents: owner update" on public.career_vault_documents for update using (user_id = auth.uid());
create policy "career_vault_documents: owner delete" on public.career_vault_documents for delete using (user_id = auth.uid());

create table if not exists public.career_vault_career_cards (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  category            text not null
                        check (category in ('education','certificate','military','career','language','etc')),
  title               text not null,
  organization        text not null,
  start_date          date,
  end_date            date,
  detail              jsonb,
  source_document_id  uuid references public.career_vault_documents(id) on delete set null,
  created_at          timestamptz not null default now()
);
alter table public.career_vault_career_cards enable row level security;
create policy "career_vault_career_cards: owner select" on public.career_vault_career_cards for select using (user_id = auth.uid());
create policy "career_vault_career_cards: owner insert" on public.career_vault_career_cards for insert with check (user_id = auth.uid());
create policy "career_vault_career_cards: owner update" on public.career_vault_career_cards for update using (user_id = auth.uid());
create policy "career_vault_career_cards: owner delete" on public.career_vault_career_cards for delete using (user_id = auth.uid());

create table if not exists public.career_vault_feature_interest (
  id          uuid primary key default gen_random_uuid(),
  feature_key text not null,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz default now(),
  unique (feature_key, user_id)
);
alter table public.career_vault_feature_interest enable row level security;
create policy "career_vault_feature_interest: owner insert"
  on public.career_vault_feature_interest for insert to authenticated
  with check (user_id = auth.uid());

-- Storage: private 버킷 (버킷/정책명 모두 프로젝트 prefix — storage.objects는 전역 테이블)
insert into storage.buckets (id, name, public, file_size_limit)
values ('career-vault-certificates', 'career-vault-certificates', false, 10485760)
on conflict (id) do nothing;
create policy "career_vault certificates: owner select" on storage.objects for select
  using (bucket_id = 'career-vault-certificates' and auth.uid()::text = (string_to_array(name, '/'))[1]);
create policy "career_vault certificates: owner insert" on storage.objects for insert
  with check (bucket_id = 'career-vault-certificates' and auth.uid()::text = (string_to_array(name, '/'))[1]);
create policy "career_vault certificates: owner update" on storage.objects for update
  using (bucket_id = 'career-vault-certificates' and auth.uid()::text = (string_to_array(name, '/'))[1]);
create policy "career_vault certificates: owner delete" on storage.objects for delete
  using (bucket_id = 'career-vault-certificates' and auth.uid()::text = (string_to_array(name, '/'))[1]);


-- ============================================================
-- [patent-deadline] 고유 테이블 없음 — 공유 waitlist만 사용 (source='patent-deadline')
-- ============================================================


-- ============================================================
-- [the-counter] 영원히 1씩 올라가는 카운터 — 원자적 발급 RPC
-- ============================================================
create table if not exists the_counter_counter (
  id      int primary key default 1,
  current bigint not null default 0,
  constraint single_row check (id = 1)
);
insert into the_counter_counter (id, current) values (1, 0) on conflict (id) do nothing;

create table if not exists the_counter_entries (
  number       bigint primary key,
  display_name text not null,
  message      text not null,
  created_at   timestamptz not null default now()
);
alter table the_counter_counter enable row level security;
alter table the_counter_entries enable row level security;
create policy "the_counter_entries_select_public"
  on the_counter_entries for select to anon, authenticated using (true);
-- the_counter_counter: 정책 없음 = 클라이언트 직접 접근 차단 (RPC 경유만)

create or replace function the_counter_claim_next_number(p_name text, p_message text)
returns the_counter_entries
language plpgsql
security definer
as $$
declare
  v_number bigint;
  v_entry  the_counter_entries;
begin
  update the_counter_counter set current = current + 1 where id = 1 returning current into v_number;
  insert into the_counter_entries (number, display_name, message)
  values (v_number, p_name, p_message) returning * into v_entry;
  return v_entry;
end;
$$;


-- ============================================================
-- [the-rgb] 16,777,216개 색 중 하나 영구 소유 — hex PK
-- ============================================================
create table if not exists the_rgb_colors (
  hex        text primary key check (hex ~ '^#[0-9a-f]{6}$'),
  name       text not null check (length(trim(name)) >= 1 and length(name) <= 24),
  message    text not null check (length(trim(message)) >= 1 and length(message) <= 80),
  created_at timestamptz not null default now()
);
alter table the_rgb_colors enable row level security;
create policy "colors_select_public" on the_rgb_colors for select using (true);
create policy "colors_insert_service_only" on the_rgb_colors for insert with check (auth.role() = 'service_role');


-- ============================================================
-- [the-3-letters] AAA~ZZZ 17,576개 코드 중 하나 영구 소유 — code PK
-- ============================================================
create table if not exists the_3_letters_codes (
  code        text primary key,
  name        text not null,
  message     text not null,
  created_at  timestamptz not null default now(),
  constraint code_format    check (code ~ '^[A-Z]{3}$'),
  constraint name_length    check (char_length(name) between 1 and 24),
  constraint message_length check (char_length(message) between 1 and 80)
);
alter table the_3_letters_codes enable row level security;
create policy "public can select the_3_letters_codes"
  on the_3_letters_codes for select using (true);
-- 쓰기: service_role(secret key)이 RLS bypass → anon insert 정책 미부여로 서버 전용


-- ============================================================
-- [skinclash] 익명 성공 지표 계측 — 개인정보 없음, 집계용
-- ============================================================
create table if not exists public.skinclash_check_log (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  product_count       int not null,
  detected_active_ids text[] not null,
  warn_count          int not null,
  safe_count          int not null,
  used_llm            bool not null
);
-- 서버(secret key)만 접근 — RLS 활성화 후 anon 정책 없음으로 클라이언트 직접 접근 차단
alter table public.skinclash_check_log enable row level security;

create table if not exists public.skinclash_check_log_pairs (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  active_a   text not null,
  active_b   text not null
);
-- 서버(secret key)만 접근 — RLS 활성화 후 anon 정책 없음으로 클라이언트 직접 접근 차단
alter table public.skinclash_check_log_pairs enable row level security;
