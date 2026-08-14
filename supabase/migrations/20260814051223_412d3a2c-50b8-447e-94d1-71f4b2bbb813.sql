alter table public.leads alter column company drop not null;
alter table public.leads alter column city drop not null;
alter table public.leads alter column state drop not null;
alter table public.leads alter column requirements drop not null;
alter table public.leads alter column company drop default;
alter table public.leads alter column city drop default;
alter table public.leads alter column state drop default;
alter table public.leads alter column requirements drop default;
alter table public.lead_routing_rules add column if not exists execution_count integer not null default 0;
alter table public.lead_automation_rules add column if not exists accuracy numeric not null default 0;
alter table public.lead_integrations add column if not exists description text not null default '';
update public.lead_integrations set description = case integration_key
  when 'whatsapp' then 'Capture and reply to leads over WhatsApp Business.'
  when 'gmail' then 'Send and log email conversations with leads.'
  when 'slack' then 'Push new lead and escalation alerts to Slack.'
  else 'Forward lead events to an external endpoint.' end
where description = '';