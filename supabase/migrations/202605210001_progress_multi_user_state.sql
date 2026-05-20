alter table public.linguaai_user_progress
  add column if not exists last_session_date text,
  add column if not exists story_progress jsonb,
  add column if not exists npc_relationships jsonb,
  add column if not exists npc_emotions jsonb,
  add column if not exists expression_book jsonb,
  add column if not exists story_io_ratio jsonb,
  add column if not exists story_clues jsonb,
  add column if not exists known_words jsonb;

create or replace function public.linguaai_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop policy if exists linguaai_progress_select_own on public.linguaai_user_progress;
drop policy if exists linguaai_progress_insert_own on public.linguaai_user_progress;
drop policy if exists linguaai_progress_update_own on public.linguaai_user_progress;

create policy linguaai_progress_select_own
on public.linguaai_user_progress
for select
using ((select auth.uid()) = user_id);

create policy linguaai_progress_insert_own
on public.linguaai_user_progress
for insert
with check ((select auth.uid()) = user_id);

create policy linguaai_progress_update_own
on public.linguaai_user_progress
for update
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
