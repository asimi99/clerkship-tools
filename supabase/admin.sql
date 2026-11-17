-- Owner-only usage report. Run once in the Supabase SQL editor.
create or replace function public.admin_usage(days int default 30)
returns table(who text, kind text, day date, n int)
language plpgsql security definer set search_path = public, auth as $$
begin
  if coalesce(auth.jwt()->>'email','') <> 'asimibrahim1999@gmail.com' then
    raise exception 'not allowed';
  end if;
  return query
  select
    case when u.key like '%u:%' then coalesce(au.email, 'deleted user') else 'guest ' || right(u.key, 6) end as who,
    case when u.key like 'p%' then 'pdf' else 'coach' end as kind,
    u.day, u.n
  from public.usage u
  left join auth.users au on u.key like '%u:%' and au.id::text = split_part(u.key, 'u:', 2)
  where u.day >= current_date - days
  order by u.day desc, u.n desc;
end $$;
revoke all on function public.admin_usage(int) from public, anon;
grant execute on function public.admin_usage(int) to authenticated;

create or replace function public.admin_signups()
returns table(email text, created_at timestamptz, last_sign_in_at timestamptz, provider text)
language plpgsql security definer set search_path = public, auth as $$
begin
  if coalesce(auth.jwt()->>'email','') <> 'asimibrahim1999@gmail.com' then
    raise exception 'not allowed';
  end if;
  return query select au.email::text, au.created_at, au.last_sign_in_at, coalesce(au.raw_app_meta_data->>'provider','email')
  from auth.users au order by au.created_at desc;
end $$;
revoke all on function public.admin_signups() from public, anon;
grant execute on function public.admin_signups() to authenticated;
