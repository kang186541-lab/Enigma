-- Phase 7 institutional pilot metrics.
--
-- This mirrors the Supabase migration already applied to the live `linguaai`
-- project as version 20260611222944. Keep it in-repo so the pilot schema is
-- reproducible for fresh projects, audits, and disaster recovery.

begin;

create table if not exists public.linguaai_learning_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event text not null,
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists linguaai_learning_events_user_created_idx
  on public.linguaai_learning_events (user_id, created_at desc);

create index if not exists linguaai_learning_events_event_created_idx
  on public.linguaai_learning_events (event, created_at desc);

alter table public.linguaai_learning_events enable row level security;

drop policy if exists linguaai_learning_events_select_own on public.linguaai_learning_events;
drop policy if exists linguaai_learning_events_insert_own on public.linguaai_learning_events;

create policy linguaai_learning_events_select_own
on public.linguaai_learning_events
for select
to authenticated
using (auth.uid() = user_id);

create policy linguaai_learning_events_insert_own
on public.linguaai_learning_events
for insert
to authenticated
with check (auth.uid() = user_id);

grant select, insert on table public.linguaai_learning_events to authenticated;

create table if not exists public.linguaai_cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  join_code text not null,
  teacher_key text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists linguaai_cohorts_join_code_uidx
  on public.linguaai_cohorts (lower(join_code));

alter table public.linguaai_cohorts enable row level security;

revoke all on table public.linguaai_cohorts from anon, authenticated;

create table if not exists public.linguaai_cohort_members (
  cohort_id uuid not null references public.linguaai_cohorts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (cohort_id, user_id)
);

create index if not exists linguaai_cohort_members_user_idx
  on public.linguaai_cohort_members (user_id);

alter table public.linguaai_cohort_members enable row level security;

revoke all on table public.linguaai_cohort_members from anon, authenticated;

create or replace function public.join_cohort(code text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_code text := btrim(coalesce(code, ''));
  v_cohort_id uuid;
  v_cohort_name text;
begin
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  if v_code = '' then
    raise exception 'INVALID_CODE';
  end if;

  select id, name
    into v_cohort_id, v_cohort_name
  from public.linguaai_cohorts
  where lower(join_code) = lower(v_code)
  limit 1;

  if v_cohort_id is null then
    raise exception 'INVALID_CODE';
  end if;

  insert into public.linguaai_cohort_members (cohort_id, user_id)
  values (v_cohort_id, v_uid)
  on conflict (cohort_id, user_id) do nothing;

  return v_cohort_name;
end;
$$;

revoke all on function public.join_cohort(text) from public, anon;
grant execute on function public.join_cohort(text) to authenticated;

insert into public.linguaai_cohorts (name, join_code, teacher_key)
values ('GNU 2026 Demo Class', 'GNU2026', 'tk-gnu-demo-7k3x9p')
on conflict do nothing;

update public.linguaai_cohorts
set
  name = 'GNU 2026 Demo Class',
  teacher_key = 'tk-gnu-demo-7k3x9p'
where lower(join_code) = lower('GNU2026');

commit;
