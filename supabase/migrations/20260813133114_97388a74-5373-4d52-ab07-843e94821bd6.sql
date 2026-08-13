CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'software',
  type text NOT NULL DEFAULT 'software',
  version text NOT NULL DEFAULT '1.0.0',
  price numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  downloads bigint NOT NULL DEFAULT 0,
  rating numeric(3,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "boss read products" ON public.products FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'boss'));
CREATE POLICY "boss write products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'boss')) WITH CHECK (public.has_role(auth.uid(),'boss'));
CREATE TABLE public.product_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  version text NOT NULL,
  changelog text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  released_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_versions TO authenticated;
GRANT ALL ON public.product_versions TO service_role;
ALTER TABLE public.product_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "boss rw product_versions" ON public.product_versions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'boss')) WITH CHECK (public.has_role(auth.uid(),'boss'));
CREATE TABLE public.source_repos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  name text NOT NULL,
  provider text NOT NULL DEFAULT 'github',
  url text NOT NULL,
  default_branch text NOT NULL DEFAULT 'main',
  latest_version text,
  build_status text NOT NULL DEFAULT 'unknown',
  last_build_at timestamptz,
  dependency_count int NOT NULL DEFAULT 0,
  outdated_dependencies int NOT NULL DEFAULT 0,
  vuln_critical int NOT NULL DEFAULT 0,
  vuln_high int NOT NULL DEFAULT 0,
  vuln_medium int NOT NULL DEFAULT 0,
  vuln_low int NOT NULL DEFAULT 0,
  license_valid boolean NOT NULL DEFAULT true,
  last_scan_at timestamptz,
  scan_findings jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.source_repos TO authenticated;
GRANT ALL ON public.source_repos TO service_role;
ALTER TABLE public.source_repos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "boss rw repos" ON public.source_repos FOR ALL TO authenticated USING (public.has_role(auth.uid(),'boss')) WITH CHECK (public.has_role(auth.uid(),'boss'));
CREATE TABLE public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  entity text NOT NULL,
  entity_id text,
  action text NOT NULL,
  summary text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  severity text NOT NULL DEFAULT 'info',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_events_entity_idx ON public.audit_events(entity, entity_id, created_at DESC);
CREATE INDEX audit_events_created_idx ON public.audit_events(created_at DESC);
GRANT SELECT ON public.audit_events TO authenticated;
GRANT ALL ON public.audit_events TO service_role;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "boss read audit" ON public.audit_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'boss'));
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  severity text NOT NULL DEFAULT 'info',
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_idx ON public.notifications(user_id, created_at DESC);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users mark own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER set_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_repos_updated BEFORE UPDATE ON public.source_repos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TABLE public.auth_gate_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NULL,
  email TEXT NULL,
  wall_route TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('signin','forbidden','rate_limited')),
  status_code INT NULL,
  message TEXT NULL,
  user_agent TEXT NULL,
  ip TEXT NULL
);
CREATE INDEX auth_gate_events_occurred_at_idx ON public.auth_gate_events (occurred_at DESC);
CREATE INDEX auth_gate_events_wall_route_idx ON public.auth_gate_events (wall_route);
CREATE INDEX auth_gate_events_state_idx ON public.auth_gate_events (state);
GRANT SELECT ON public.auth_gate_events TO authenticated;
GRANT ALL ON public.auth_gate_events TO service_role;
ALTER TABLE public.auth_gate_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Boss can read auth gate events"
  ON public.auth_gate_events
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'boss'));
DO $$ BEGIN
  CREATE TYPE public.author_status AS ENUM ('verified','pending','suspended','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.application_stage AS ENUM ('registration','identity','kyc','portfolio','interview','agreement','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE TABLE IF NOT EXISTS public.authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  company text,
  country text,
  status public.author_status NOT NULL DEFAULT 'pending',
  verified boolean NOT NULL DEFAULT false,
  products_count integer NOT NULL DEFAULT 0,
  rating numeric(3,2),
  revenue numeric(14,2) NOT NULL DEFAULT 0,
  royalties numeric(14,2) NOT NULL DEFAULT 0,
  health_score integer NOT NULL DEFAULT 0 CHECK (health_score BETWEEN 0 AND 100),
  risk_score integer NOT NULL DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  joined_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.authors TO authenticated;
GRANT ALL ON public.authors TO service_role;
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "boss can read authors" ON public.authors FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'boss'));
CREATE POLICY "boss can insert authors" ON public.authors FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'boss'));
CREATE POLICY "boss can update authors" ON public.authors FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'boss')) WITH CHECK (public.has_role(auth.uid(), 'boss'));
CREATE POLICY "boss can delete authors" ON public.authors FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'boss'));
CREATE TRIGGER trg_authors_updated_at BEFORE UPDATE ON public.authors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name text NOT NULL,
  email text NOT NULL,
  country text,
  stage public.application_stage NOT NULL DEFAULT 'registration',
  reviewer_email text,
  notes text,
  author_id uuid REFERENCES public.authors(id) ON DELETE SET NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "boss can read applications" ON public.applications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'boss'));
CREATE POLICY "boss can insert applications" ON public.applications FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'boss'));
CREATE POLICY "boss can update applications" ON public.applications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'boss')) WITH CHECK (public.has_role(auth.uid(), 'boss'));
CREATE POLICY "boss can delete applications" ON public.applications FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'boss'));
CREATE TRIGGER trg_applications_updated_at BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_applications_stage ON public.applications(stage);
CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON public.applications(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_authors_status ON public.authors(status);
CREATE INDEX IF NOT EXISTS idx_authors_updated_at ON public.authors(updated_at DESC);