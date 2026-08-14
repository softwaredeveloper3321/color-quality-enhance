alter table public.seo_content_items add column if not exists model text;
alter table public.seo_reels add column if not exists model text;
alter table public.seo_ai_suggestions add column if not exists model text;
alter table public.seo_keywords alter column position drop not null;