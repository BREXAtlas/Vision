create table if not exists public.vision_memory (
  user_id uuid primary key references auth.users(id) on delete cascade,
  app_state jsonb,
  simulation_state jsonb,
  updated_at timestamptz not null default now()
);

alter table public.vision_memory enable row level security;

revoke all on table public.vision_memory from anon;
grant select, insert, update, delete on table public.vision_memory to authenticated;

create policy "vision_memory_select_own"
on public.vision_memory
for select
to authenticated
using (auth.uid() = user_id);

create policy "vision_memory_insert_own"
on public.vision_memory
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "vision_memory_update_own"
on public.vision_memory
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "vision_memory_delete_own"
on public.vision_memory
for delete
to authenticated
using (auth.uid() = user_id);

comment on table public.vision_memory is
  'Private cross-device sync for the Vision Life simulation and Vision 2031 app. RLS restricts each row to its authenticated owner.';
