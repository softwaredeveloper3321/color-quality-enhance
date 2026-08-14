create table if not exists public.lead_agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null default '',
  role text not null default 'Sales Executive',
  team text not null default 'Inbound',
  status text not null default 'online',
  capacity integer not null default 25,
  conversion_rate numeric not null default 0,
  avg_response_minutes integer not null default 15,
  can_export boolean not null default false,
  can_unmask boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null default '',
  phone text not null default '',
  company text not null default '',
  city text not null default '',
  state text not null default '',
  country text not null default 'India',
  industry text not null default 'General',
  category text not null default 'General',
  language text not null default 'English',
  device text not null default 'desktop',
  campaign text not null default '',
  requirements text not null default '',
  source text not null default 'website',
  sub_source text not null default 'direct',
  status text not null default 'new',
  priority text not null default 'medium',
  temperature text not null default 'warm',
  ai_score integer not null default 50,
  intent_score integer not null default 50,
  fraud_score integer not null default 0,
  conversion_probability integer not null default 30,
  deal_value numeric not null default 0,
  budget_range text,
  assigned_agent_id uuid references public.lead_agents(id) on delete set null,
  assigned_at timestamptz,
  last_contact_at timestamptz,
  next_follow_up timestamptz,
  closed_at timestamptz,
  lost_reason text,
  spam_reason text,
  is_duplicate boolean not null default false,
  duplicate_of uuid,
  duplicate_score integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'website',
  sub_sources jsonb not null default '[]'::jsonb,
  utm_source text,
  utm_medium text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  content text not null,
  created_by text not null default 'Lead Manager Console',
  created_at timestamptz not null default now()
);

create table if not exists public.lead_communications (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  type text not null default 'note',
  direction text not null default 'outbound',
  subject text,
  content text not null default '',
  created_by text not null default 'Lead Manager Console',
  created_at timestamptz not null default now()
);

create table if not exists public.lead_follow_ups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  agent_id uuid references public.lead_agents(id) on delete set null,
  follow_up_type text not null default 'call',
  scheduled_at timestamptz not null default now(),
  notes text,
  suggested_message text,
  is_completed boolean not null default false,
  completed_at timestamptz,
  outcome text,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_escalations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  reason text not null default '',
  level text not null default 'L1',
  idle_minutes integer not null default 0,
  is_resolved boolean not null default false,
  resolved_at timestamptz,
  resolution_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_alerts (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  alert_type text not null default 'system',
  message text not null default '',
  severity text not null default 'medium',
  is_active boolean not null default true,
  acknowledged_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_assignments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  agent_id uuid references public.lead_agents(id) on delete set null,
  previous_agent_id uuid references public.lead_agents(id) on delete set null,
  reason text not null default '',
  auto_assigned boolean not null default false,
  assignment_score integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_scores (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  score_type text not null default 'ai_quality',
  score integer not null default 0,
  confidence integer not null default 80,
  model_version text not null default 'v1',
  factors jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_routing_rules (
  id uuid primary key default gen_random_uuid(),
  rule_key text not null unique,
  name text not null,
  description text not null default '',
  strategy text not null default 'load_balance',
  target_team text not null default 'Inbound',
  accuracy numeric not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_automation_rules (
  id uuid primary key default gen_random_uuid(),
  rule_key text not null unique,
  name text not null,
  description text not null default '',
  trigger_event text not null default 'lead_created',
  execution_count integer not null default 0,
  last_executed_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_integrations (
  id uuid primary key default gen_random_uuid(),
  integration_key text not null unique,
  name text not null,
  category text not null default 'crm',
  status text not null default 'disconnected',
  is_enabled boolean not null default false,
  events_today integer not null default 0,
  last_sync_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_integration_events (
  id uuid primary key default gen_random_uuid(),
  integration_key text not null,
  event text not null,
  detail text not null default '',
  status text not null default 'success',
  created_at timestamptz not null default now()
);

create table if not exists public.lead_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  label text not null,
  description text not null default '',
  category text not null default 'general',
  value_bool boolean,
  value_text text,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_audit_logs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  action text not null,
  action_type text not null default 'read',
  details text,
  actor text not null default 'Lead Manager Console',
  actor_role text not null default 'Admin',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

do $$
declare t text;
  tabs text[] := array['leads','lead_agents','lead_sources','lead_notes','lead_communications',
    'lead_follow_ups','lead_escalations','lead_alerts','lead_assignments','lead_scores',
    'lead_routing_rules','lead_automation_rules','lead_integrations','lead_integration_events',
    'lead_settings','lead_audit_logs'];
begin
  foreach t in array tabs loop
    execute format('alter table public.%I enable row level security', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('drop policy if exists "Authenticated manage %1$s" on public.%1$I', t);
    execute format('create policy "Authenticated manage %1$s" on public.%1$I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

insert into public.lead_agents (name, email, role, team, status, capacity, conversion_rate, avg_response_minutes, can_export, can_unmask)
values
  ('Aarav Mehta','aarav@softwarevala.com','Senior Sales Executive','Inbound','online',30,42.5,8,true,true),
  ('Priya Nair','priya@softwarevala.com','Sales Executive','Inbound','online',25,36.2,12,false,true),
  ('Rohan Gupta','rohan@softwarevala.com','Enterprise AE','Enterprise','busy',15,51.4,18,true,false),
  ('Sneha Rao','sneha@softwarevala.com','SDR','Outbound','offline',35,22.8,25,false,false)
on conflict do nothing;

insert into public.lead_sources (name, type, sub_sources, utm_source, utm_medium, is_active) values
  ('Website','website','["contact-form","pricing","demo-request"]','site','organic',true),
  ('Organic Search','seo','["google","bing"]','google','organic',true),
  ('Paid Ads','ads','["google-ads","meta-ads"]','google','cpc',true),
  ('Social','social','["linkedin","instagram"]','linkedin','social',true),
  ('Marketplace','marketplace','["listing","demo"]','marketplace','referral',true),
  ('WhatsApp','whatsapp','["business-api"]','whatsapp','chat',true)
on conflict do nothing;

insert into public.lead_routing_rules (rule_key, name, description, strategy, target_team, accuracy, is_active) values
  ('load_balance','Load balancing','Routes new leads to the online agent with the lowest open load.','load_balance','Inbound',94.2,true),
  ('enterprise_priority','Enterprise priority','High budget leads go straight to the enterprise team.','priority','Enterprise',88.7,true),
  ('after_hours','After-hours queue','Holds leads captured outside business hours for the next shift.','queue','Inbound',79.5,false)
on conflict (rule_key) do nothing;

insert into public.lead_automation_rules (rule_key, name, description, trigger_event, execution_count, is_active) values
  ('instant_ack','Instant acknowledgement','Sends a welcome message the moment a lead is captured.','lead_created',412,true),
  ('idle_nudge','Idle nudge','Reminds the owner when a lead has been untouched for 24 hours.','lead_idle',186,true),
  ('spam_guard','Spam guard','Auto-flags leads with a high fraud score.','lead_scored',73,true)
on conflict (rule_key) do nothing;

insert into public.lead_integrations (integration_key, name, category, status, is_enabled, events_today) values
  ('whatsapp','WhatsApp Business','messaging','disconnected',false,0),
  ('gmail','Email (SMTP)','email','disconnected',false,0),
  ('slack','Slack Alerts','notifications','disconnected',false,0),
  ('webhook','Outbound Webhook','crm','disconnected',false,0)
on conflict (integration_key) do nothing;

insert into public.lead_settings (setting_key, label, description, category, value_bool, value_text) values
  ('auto_assign','Auto assignment','Automatically route new leads to available agents.','routing',true,null),
  ('mask_contacts','Mask contact details','Hide phone and email unless the agent has unmask rights.','security',true,null),
  ('duplicate_detection','Duplicate detection','Flag leads that match an existing record.','quality',true,null),
  ('sla_minutes','First response SLA','Target first-response time in minutes.','sla',null,'15'),
  ('working_hours','Working hours','Business hours used by the after-hours queue.','general',null,'09:00-19:00 IST')
on conflict (setting_key) do nothing;