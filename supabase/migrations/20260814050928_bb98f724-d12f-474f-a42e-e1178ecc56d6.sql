create table if not exists public.seo_pages (
  id uuid primary key default gen_random_uuid(),
  url text not null unique,
  title text not null default '',
  meta_title text,
  meta_description text,
  h1 text,
  canonical_url text,
  word_count integer not null default 0,
  seo_score integer not null default 0,
  page_type text not null default 'landing',
  index_status text not null default 'indexed',
  issues_count integer not null default 0,
  status text not null default 'indexed',
  last_crawled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seo_keywords (
  id uuid primary key default gen_random_uuid(),
  keyword text not null,
  target_url text,
  position integer not null default 0,
  previous_position integer,
  search_volume integer not null default 0,
  difficulty integer not null default 0,
  cpc numeric not null default 0,
  intent text not null default 'informational',
  industry text,
  country text,
  region text not null default 'global',
  status text not null default 'tracking',
  created_at timestamptz not null default now()
);

create table if not exists public.seo_keyword_rankings (
  id uuid primary key default gen_random_uuid(),
  keyword_id uuid references public.seo_keywords(id) on delete cascade,
  keyword text,
  url text,
  position integer not null default 0,
  recorded_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.seo_meta_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url_pattern text not null,
  title_template text not null default '',
  description_template text not null default '',
  og_image_template text,
  priority integer not null default 1,
  applies_to integer not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.seo_indexing_records (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  source text not null default 'manual',
  crawl_status text not null default 'queued',
  index_state text not null default 'discovered',
  http_status integer not null default 200,
  notes text,
  last_crawled_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.seo_issues (
  id uuid primary key default gen_random_uuid(),
  page_url text not null,
  issue_type text not null,
  category text not null default 'technical',
  severity text not null default 'medium',
  description text not null default '',
  fix_suggestion text,
  status text not null default 'open',
  detected_at timestamptz not null default now()
);

create table if not exists public.seo_backlinks (
  id uuid primary key default gen_random_uuid(),
  source_domain text not null,
  source_url text not null,
  target_url text not null,
  anchor_text text,
  domain_authority integer not null default 0,
  link_type text not null default 'dofollow',
  spam_score integer not null default 0,
  status text not null default 'active',
  first_seen_at timestamptz not null default now()
);

create table if not exists public.seo_competitors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text not null,
  region text not null default 'global',
  visibility_score numeric not null default 0,
  keywords_count integer not null default 0,
  backlinks_count integer not null default 0,
  traffic_estimate integer not null default 0,
  domain_authority integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.seo_competitor_gaps (
  id uuid primary key default gen_random_uuid(),
  competitor_id uuid references public.seo_competitors(id) on delete cascade,
  keyword text not null,
  our_position integer,
  their_position integer,
  search_volume integer not null default 0,
  opportunity text not null default 'medium',
  created_at timestamptz not null default now()
);

create table if not exists public.seo_content_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content_type text not null default 'blog',
  target_keyword text,
  body text,
  word_count integer not null default 0,
  seo_score integer not null default 0,
  url text,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists public.seo_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  company text,
  email text not null,
  phone text,
  country text,
  source_channel text not null default 'organic',
  source_keyword text,
  landing_url text,
  score integer not null default 0,
  stage text not null default 'new',
  estimated_value numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.seo_ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text not null default 'google',
  status text not null default 'draft',
  budget numeric not null default 0,
  spend numeric not null default 0,
  impressions integer not null default 0,
  clicks integer not null default 0,
  conversions integer not null default 0,
  cpa numeric not null default 0,
  roas numeric not null default 0,
  starts_on date,
  ends_on date,
  created_at timestamptz not null default now()
);

create table if not exists public.seo_email_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  segment text not null default 'all-leads',
  subject text not null default '',
  status text not null default 'draft',
  scheduled_at timestamptz,
  sent_count integer not null default 0,
  opened_count integer not null default 0,
  clicked_count integer not null default 0,
  replied_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.seo_social_posts (
  id uuid primary key default gen_random_uuid(),
  platform text not null default 'linkedin',
  content text not null default '',
  link_url text,
  status text not null default 'draft',
  scheduled_at timestamptz,
  published_at timestamptz,
  impressions integer not null default 0,
  engagements integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.seo_social_comments (
  id uuid primary key default gen_random_uuid(),
  platform text not null default 'linkedin',
  author text not null,
  comment text not null default '',
  sentiment text not null default 'neutral',
  auto_reply text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.seo_inbox_messages (
  id uuid primary key default gen_random_uuid(),
  channel text not null default 'email',
  contact_name text not null,
  contact_handle text,
  message text not null default '',
  auto_reply text,
  status text not null default 'unread',
  created_at timestamptz not null default now()
);

create table if not exists public.seo_reels (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  prompt text not null default '',
  script text,
  platform text not null default 'instagram',
  duration_seconds integer not null default 30,
  status text not null default 'draft',
  views integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.seo_product_entries (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  category text not null default 'general',
  target_keywords text[] not null default '{}',
  meta_title text,
  meta_description text,
  structured_data jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists public.seo_automations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  automation_type text not null default 'on-page',
  description text,
  schedule text not null default 'daily',
  status text not null default 'active',
  next_run_at timestamptz,
  last_run_at timestamptz,
  runs_count integer not null default 0,
  success_rate numeric not null default 100,
  created_at timestamptz not null default now()
);

create table if not exists public.seo_automation_runs (
  id uuid primary key default gen_random_uuid(),
  automation_id uuid references public.seo_automations(id) on delete cascade,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'success',
  items_processed integer not null default 0,
  message text
);

create table if not exists public.seo_automation_flows (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trigger_event text not null,
  status text not null default 'active',
  steps integer not null default 0,
  executions integer not null default 0,
  conversion_rate numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.seo_alerts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null default '',
  category text not null default 'technical',
  severity text not null default 'medium',
  acknowledged boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.seo_technical_checks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'crawlability',
  status text not null default 'pass',
  detail text,
  affected_urls integer not null default 0,
  last_checked_at timestamptz not null default now()
);

create table if not exists public.seo_integrations (
  id uuid primary key default gen_random_uuid(),
  provider text not null unique,
  display_name text not null,
  category text not null default 'analytics',
  status text not null default 'disconnected',
  last_sync_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.seo_ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  target_type text not null default 'site',
  target_ref text,
  suggestion text not null default '',
  impact text not null default 'medium',
  confidence integer not null default 80,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.seo_reports (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  report_type text not null default 'monthly',
  period_start date not null default current_date,
  period_end date not null default current_date,
  status text not null default 'ready',
  summary jsonb,
  generated_at timestamptz not null default now()
);

create table if not exists public.seo_audits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'running',
  score integer not null default 0,
  pages_crawled integer not null default 0,
  issues_found integer not null default 0,
  breakdown jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.seo_activity_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  table_name text not null,
  record_id uuid,
  actor text,
  details jsonb,
  occurred_at timestamptz not null default now()
);

create table if not exists public.seo_performance_metrics (
  id uuid primary key default gen_random_uuid(),
  recorded_on date not null unique,
  clicks integer not null default 0,
  impressions integer not null default 0,
  ctr numeric not null default 0,
  avg_position numeric not null default 0,
  conversions integer not null default 0,
  organic_sessions integer not null default 0,
  lcp_ms integer not null default 0,
  inp_ms integer not null default 0,
  cls numeric not null default 0
);

create table if not exists public.seo_regions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null,
  flag text,
  region_group text not null default 'global',
  keywords_count integer not null default 0,
  traffic_share numeric not null default 0,
  growth_pct numeric not null default 0
);

create table if not exists public.seo_page_behavior (
  id uuid primary key default gen_random_uuid(),
  page_url text not null,
  recorded_on date not null default current_date,
  sessions integer not null default 0,
  avg_time_seconds integer not null default 0,
  scroll_depth_pct integer not null default 0,
  clicks integer not null default 0,
  rage_clicks integer not null default 0,
  bounce_rate numeric not null default 0
);

create table if not exists public.seo_spam_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  source_ip text,
  country text,
  detail text,
  blocked boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.seo_benchmark_runs (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  target text not null,
  ttfb_ms integer not null default 0,
  query_ms integer not null default 0,
  pagination_ms integer not null default 0,
  report_ms integer not null default 0,
  rows_scanned integer not null default 0,
  status text not null default 'good',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.seo_error_events (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  name text not null,
  message text not null,
  stack text,
  route text,
  fn_name text,
  severity text not null default 'error',
  occurrences integer not null default 1,
  resolved boolean not null default false,
  context jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

do $$
declare t text;
  public_tables text[] := array[
    'seo_pages','seo_keywords','seo_keyword_rankings','seo_meta_rules','seo_indexing_records',
    'seo_issues','seo_backlinks','seo_competitors','seo_competitor_gaps','seo_content_items',
    'seo_ad_campaigns','seo_email_campaigns','seo_social_posts','seo_social_comments','seo_reels',
    'seo_product_entries','seo_automations','seo_automation_runs','seo_automation_flows','seo_alerts',
    'seo_technical_checks','seo_integrations','seo_ai_suggestions','seo_reports','seo_audits',
    'seo_activity_log','seo_performance_metrics','seo_regions','seo_page_behavior','seo_spam_events',
    'seo_benchmark_runs'
  ];
  private_tables text[] := array['seo_leads','seo_inbox_messages','seo_error_events'];
begin
  foreach t in array public_tables loop
    execute format('alter table public.%I enable row level security', t);
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('drop policy if exists "Public read %1$s" on public.%1$I', t);
    execute format('create policy "Public read %1$s" on public.%1$I for select to anon, authenticated using (true)', t);
  end loop;

  foreach t in array private_tables loop
    execute format('alter table public.%I enable row level security', t);
    execute format('grant select on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('drop policy if exists "Authenticated read %1$s" on public.%1$I', t);
    execute format('create policy "Authenticated read %1$s" on public.%1$I for select to authenticated using (true)', t);
  end loop;
end $$;