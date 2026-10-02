-- Sliding windows, serialized per anonymized IP across all Edge instances.
create table public.contact_rate_limits (
  client_key text primary key check (client_key ~ '^[a-f0-9]{64}$'),
  attempts timestamptz[] not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.contact_rate_limits enable row level security;
revoke all on public.contact_rate_limits from public, anon, authenticated;

create function public.consume_contact_attempt(p_client_key text, p_minute_limit integer, p_hour_limit integer)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent timestamptz[];
  minute_attempts timestamptz[];
  current_time_at_lock timestamptz;
  wait_seconds integer := 0;
begin
  if p_minute_limit not between 1 and 1000 or p_hour_limit not between 1 and 1000
     or p_minute_limit is null or p_hour_limit is null then
    raise exception 'Invalid limits';
  end if;
  insert into public.contact_rate_limits(client_key) values (p_client_key) on conflict do nothing;
  select attempts into recent from public.contact_rate_limits where client_key = p_client_key for update;
  current_time_at_lock := clock_timestamp();
  select coalesce(array_agg(t order by t), '{}') into recent
    from unnest(recent) t where t > current_time_at_lock - interval '1 hour';
  select coalesce(array_agg(t order by t), '{}') into minute_attempts
    from unnest(recent) t where t > current_time_at_lock - interval '1 minute';
  if cardinality(minute_attempts) >= p_minute_limit then
    wait_seconds := greatest(wait_seconds, ceil(extract(epoch from
      minute_attempts[cardinality(minute_attempts) - p_minute_limit + 1] + interval '1 minute' - current_time_at_lock))::integer);
  end if;
  if cardinality(recent) >= p_hour_limit then
    wait_seconds := greatest(wait_seconds, ceil(extract(epoch from
      recent[cardinality(recent) - p_hour_limit + 1] + interval '1 hour' - current_time_at_lock))::integer);
  end if;
  if wait_seconds > 0 then
    return jsonb_build_object('allowed', false, 'retry_after', wait_seconds);
  end if;
  update public.contact_rate_limits set attempts = array_append(recent, current_time_at_lock), updated_at = current_time_at_lock
    where client_key = p_client_key;
  return jsonb_build_object('allowed', true, 'retry_after', 0);
end;
$$;
revoke all on function public.consume_contact_attempt(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_contact_attempt(text, integer, integer) to service_role;

-- Run hourly via Supabase Cron; never delete active windows.
create function public.cleanup_contact_rate_limits() returns void
language sql security definer set search_path = '' as $$
  delete from public.contact_rate_limits where updated_at < now() - interval '2 hours';
$$;
revoke all on function public.cleanup_contact_rate_limits() from public, anon, authenticated;
grant execute on function public.cleanup_contact_rate_limits() to service_role;
