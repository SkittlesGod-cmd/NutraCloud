-- Agent builder tables (Pro feature)
-- Run in Supabase SQL editor

create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  model text not null,
  persona text,
  target_population text,
  product_type text,
  auto_enrich boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table agents enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'agents' and policyname = 'Users own their agents'
  ) then
    create policy "Users own their agents"
      on agents for all
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end $$;

create table if not exists agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references agents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  goal text not null,
  status text not null default 'running' check (status in ('running', 'complete', 'failed')),
  formulation_id uuid references formulations(id) on delete set null,
  error_message text,
  created_at timestamptz not null default now()
);

alter table agent_runs enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'agent_runs' and policyname = 'Users own their agent runs'
  ) then
    create policy "Users own their agent runs"
      on agent_runs for all
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end $$;
