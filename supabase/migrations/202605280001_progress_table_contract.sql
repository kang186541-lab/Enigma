-- Idempotent contract for the client-side progress sync surface.
-- The app reads/writes this table through Supabase Auth + RLS and depends on
-- `user_id` being conflict-targetable for `.upsert(..., { onConflict: "user_id" })`.

begin;

create table if not exists public.linguaai_user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0,
  level integer not null default 1,
  streak_days integer not null default 0,
  words_learned integer not null default 0,
  last_session_at timestamptz,
  last_session_date text,
  native_lang text,
  learning_lang text,
  srs_data jsonb,
  daily_course_progress jsonb,
  achievements jsonb,
  weekly_xp jsonb,
  learner_profile jsonb,
  story_progress jsonb,
  npc_relationships jsonb,
  npc_emotions jsonb,
  expression_book jsonb,
  story_io_ratio jsonb,
  story_clues jsonb,
  known_words jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.linguaai_user_progress
  add column if not exists user_id uuid,
  add column if not exists xp integer default 0,
  add column if not exists level integer default 1,
  add column if not exists streak_days integer default 0,
  add column if not exists words_learned integer default 0,
  add column if not exists last_session_at timestamptz,
  add column if not exists last_session_date text,
  add column if not exists native_lang text,
  add column if not exists learning_lang text,
  add column if not exists srs_data jsonb,
  add column if not exists daily_course_progress jsonb,
  add column if not exists achievements jsonb,
  add column if not exists weekly_xp jsonb,
  add column if not exists learner_profile jsonb,
  add column if not exists story_progress jsonb,
  add column if not exists npc_relationships jsonb,
  add column if not exists npc_emotions jsonb,
  add column if not exists expression_book jsonb,
  add column if not exists story_io_ratio jsonb,
  add column if not exists story_clues jsonb,
  add column if not exists known_words jsonb,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.linguaai_user_progress
set
  xp = coalesce(xp, 0),
  level = coalesce(level, 1),
  streak_days = coalesce(streak_days, 0),
  words_learned = coalesce(words_learned, 0),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now());

alter table public.linguaai_user_progress
  alter column xp set default 0,
  alter column level set default 1,
  alter column streak_days set default 0,
  alter column words_learned set default 0,
  alter column created_at set default now(),
  alter column updated_at set default now(),
  alter column xp set not null,
  alter column level set not null,
  alter column streak_days set not null,
  alter column words_learned set not null,
  alter column created_at set not null,
  alter column updated_at set not null;

create unique index if not exists linguaai_user_progress_user_id_uidx
  on public.linguaai_user_progress (user_id);

create or replace function public.linguaai_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists linguaai_user_progress_set_updated_at on public.linguaai_user_progress;
create trigger linguaai_user_progress_set_updated_at
before update on public.linguaai_user_progress
for each row
execute function public.linguaai_set_updated_at();

alter table public.linguaai_user_progress enable row level security;

drop policy if exists linguaai_progress_select_own on public.linguaai_user_progress;
drop policy if exists linguaai_progress_insert_own on public.linguaai_user_progress;
drop policy if exists linguaai_progress_update_own on public.linguaai_user_progress;
drop policy if exists linguaai_progress_delete_own on public.linguaai_user_progress;

create policy linguaai_progress_select_own
on public.linguaai_user_progress
for select
to authenticated
using (auth.uid() = user_id);

create policy linguaai_progress_insert_own
on public.linguaai_user_progress
for insert
to authenticated
with check (auth.uid() = user_id);

create policy linguaai_progress_update_own
on public.linguaai_user_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy linguaai_progress_delete_own
on public.linguaai_user_progress
for delete
to authenticated
using (auth.uid() = user_id);

grant select, insert, update, delete on table public.linguaai_user_progress to authenticated;

commit;
