-- Run once in the Supabase SQL editor.

create table if not exists public.stemcoach_history (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  tries int not null default 1,
  ts timestamptz not null default now()
);
alter table public.stemcoach_history enable row level security;
drop policy if exists "own rows read" on public.stemcoach_history;
drop policy if exists "own rows insert" on public.stemcoach_history;
create policy "own rows read" on public.stemcoach_history for select to authenticated using (user_id = auth.uid());
create policy "own rows insert" on public.stemcoach_history for insert to authenticated with check (user_id = auth.uid());

create table if not exists public.usage (
  key text not null,
  day date not null default current_date,
  n int not null default 0,
  primary key (key, day)
);
alter table public.usage enable row level security;

create or replace function public.bump_usage(k text) returns int
language plpgsql security definer set search_path = public as $$
declare c int;
begin
  insert into public.usage(key, day, n) values (k, current_date, 1)
  on conflict (key, day) do update set n = public.usage.n + 1
  returning n into c;
  return c;
end $$;
revoke all on function public.bump_usage(text) from public, anon, authenticated;
grant execute on function public.bump_usage(text) to service_role;
