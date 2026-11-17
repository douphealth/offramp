CREATE TABLE public.offramp_submissions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), kind text NOT NULL CHECK (kind IN ('issue','request','outcome','search','no_result','billing','outbound')), service_id text, message text NOT NULL DEFAULT '' CHECK (length(message) <= 2000), outcome text CHECK (outcome IN ('yes','no','unsure')), billing text, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.offramp_submissions TO service_role;
ALTER TABLE public.offramp_submissions ENABLE ROW LEVEL SECURITY;
CREATE INDEX offramp_submissions_created ON public.offramp_submissions (created_at);
CREATE TABLE public.offramp_evidence (service_id text PRIMARY KEY, link_checked_at timestamptz NOT NULL DEFAULT now(), route_status integer, source_status integer, source_changed boolean NOT NULL DEFAULT false, needs_review boolean NOT NULL DEFAULT false);
GRANT SELECT ON public.offramp_evidence TO anon, authenticated;
GRANT ALL ON public.offramp_evidence TO service_role;
ALTER TABLE public.offramp_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public nonpersonal evidence" ON public.offramp_evidence FOR SELECT TO anon, authenticated USING (true);
CREATE TABLE public.offramp_review_queue (service_id text PRIMARY KEY, reason text NOT NULL, owner text, deadline date NOT NULL DEFAULT (CURRENT_DATE + 7), state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','in_review','approved')), updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.offramp_review_queue TO service_role;
ALTER TABLE public.offramp_review_queue ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.offramp_source_history (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), service_id text NOT NULL, fingerprint text, status integer, checked_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.offramp_source_history TO service_role;
ALTER TABLE public.offramp_source_history ENABLE ROW LEVEL SECURITY;
CREATE INDEX offramp_history_latest ON public.offramp_source_history (service_id, checked_at DESC);
CREATE TABLE public.offramp_rate_limits (key text PRIMARY KEY, hits integer NOT NULL DEFAULT 1, window_started timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.offramp_rate_limits TO service_role;
ALTER TABLE public.offramp_rate_limits ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.offramp_allow_submission(bucket text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
INSERT INTO public.offramp_rate_limits(key) VALUES(bucket) ON CONFLICT (key) DO UPDATE SET hits = CASE WHEN offramp_rate_limits.window_started < now() - interval '1 hour' THEN 1 ELSE offramp_rate_limits.hits + 1 END, window_started = CASE WHEN offramp_rate_limits.window_started < now() - interval '1 hour' THEN now() ELSE offramp_rate_limits.window_started END RETURNING hits INTO n;
RETURN n <= 60;
END; $$;
REVOKE ALL ON FUNCTION public.offramp_allow_submission(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.offramp_allow_submission(text) TO service_role;