import { createFileRoute } from '@tanstack/react-router';
import { authenticateCronRequest } from '@/integrations/supabase/cron-auth';
import { services } from '@/lib/services';
import { needsEvidenceReview, sourceText } from '@/lib/monitoring';
export const Route = createFileRoute('/api/public/check-evidence')({ server: { handlers: { POST: async ({ request }) => {
  const failure = await authenticateCronRequest(request);
  if (failure) return failure;
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  await supabaseAdmin.from('offramp_rate_limits').delete().lt('window_started', new Date(Date.now() - 2 * 86400000).toISOString());
  // Each daily invocation checks six guides; the whole catalogue cycles in nine days.
  const day = Math.floor(Date.now() / 86400000);
  const batch = services.filter((_, i) => Math.floor(i / 6) === day % Math.ceil(services.length / 6));
  const results = await Promise.all(batch.map(async s => {
    async function check(url: string, content: boolean) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(2000), headers: { 'User-Agent': 'Offramp evidence monitor' } });
        let fingerprint: string | null = null;
        if (content && response.ok) {
          const text = sourceText((await response.text()).slice(0, 1000000));
          const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
          fingerprint = Array.from(new Uint8Array(hash)).map(n => n.toString(16).padStart(2,'0')).join('');
        } else await response.body?.cancel();
        return { status: response.status, fingerprint };
      } catch { return { status: null, fingerprint: null }; }
    }
    const route = await check(s.route, false);
    const source = await check(s.source, true);
    const { data: previous, error: readError } = await supabaseAdmin.from('offramp_source_history').select('fingerprint').eq('service_id', s.id).not('fingerprint','is',null).order('checked_at',{ ascending: false }).limit(1).maybeSingle();
    if (readError) return false;
    const changed = Boolean(previous?.fingerprint && source.fingerprint && previous.fingerprint !== source.fingerprint);
    const needsReview = needsEvidenceReview(route.status, source.status, changed);
    const history = await supabaseAdmin.from('offramp_source_history').insert({ service_id: s.id, fingerprint: source.fingerprint, status: source.status });
    const evidence = await supabaseAdmin.from('offramp_evidence').upsert({ service_id: s.id, route_status: route.status, source_status: source.status, source_changed: changed, needs_review: needsReview, link_checked_at: new Date().toISOString() });
    if (history.error || evidence.error) return false;
    if (needsReview) {
      const queue = await supabaseAdmin.from('offramp_review_queue').upsert({ service_id: s.id, reason: changed ? 'Source text changed; human review required' : 'Link unavailable, blocked, or unsuccessful; inspect manually' }, { onConflict: 'service_id', ignoreDuplicates: true });
      if (queue.error) return false;
    }
    return true;
  }));
  if (results.some(result => !result)) return Response.json({ error: 'Evidence processing failed' }, { status: 503 });
  return Response.json({ checked: batch.length, editorial_changes: 0 });
} } } });
