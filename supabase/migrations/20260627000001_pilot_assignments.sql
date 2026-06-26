-- Pilot 6-week PoC: weekly assignments + completions.
--
-- Adds the teacher-managed weekly assignment plan and per-student completion
-- records that the "주차별 완료 판정" logic and teacher weekly view build on.
-- Mirrors the live `linguaai` project migration; keep in-repo so the pilot
-- schema is reproducible. Additive + RLS-protected (no drops, non-destructive).
--
-- RLS model (mirrors learning_events / cohorts):
--   linguaai_assignments            — teacher manages via service-role; cohort
--                                     MEMBERS may SELECT their cohort's plan.
--   linguaai_assignment_completions — student owns: insert/select own rows only.

begin;

create table if not exists public.linguaai_assignments (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.linguaai_cohorts(id) on delete cascade,
  week int not null,
  activity_type text not null check (activity_type in ('daily','npc','story','escape')),
  activity_ref text,
  required boolean not null default true,
  due_date date,
  created_at timestamptz not null default now()
);

create index if not exists linguaai_assignments_cohort_week_idx
  on public.linguaai_assignments (cohort_id, week);

alter table public.linguaai_assignments enable row level security;

-- Teacher writes via service-role only; cohort members may read their plan.
revoke all on table public.linguaai_assignments from anon, authenticated;

drop policy if exists linguaai_assignments_select_member on public.linguaai_assignments;
create policy linguaai_assignments_select_member
on public.linguaai_assignments
for select
to authenticated
using (exists (
  select 1 from public.linguaai_cohort_members m
  where m.cohort_id = linguaai_assignments.cohort_id
    and m.user_id = auth.uid()
));

grant select on table public.linguaai_assignments to authenticated;

create table if not exists public.linguaai_assignment_completions (
  assignment_id uuid not null references public.linguaai_assignments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (assignment_id, user_id)
);

create index if not exists linguaai_assignment_completions_user_idx
  on public.linguaai_assignment_completions (user_id);

alter table public.linguaai_assignment_completions enable row level security;

drop policy if exists linguaai_assignment_completions_select_own on public.linguaai_assignment_completions;
drop policy if exists linguaai_assignment_completions_insert_own on public.linguaai_assignment_completions;

create policy linguaai_assignment_completions_select_own
on public.linguaai_assignment_completions
for select
to authenticated
using (auth.uid() = user_id);

create policy linguaai_assignment_completions_insert_own
on public.linguaai_assignment_completions
for insert
to authenticated
with check (auth.uid() = user_id);

grant select, insert on table public.linguaai_assignment_completions to authenticated;

commit;
