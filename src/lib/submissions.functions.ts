import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { submissionSchema } from './submissions';
import { getService } from './services';
export const submitFeedback = createServerFn({ method: 'POST' }).inputValidator(input => submissionSchema.parse(input)).handler(async ({ data }) => {
  if (data.service_id && !getService(data.service_id)) throw new Error('Unknown service');
  const request = getRequest();
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) throw new Error('Please submit from Offramp.');
  const raw = request.headers.get('cf-connecting-ip') || 'shared-preview';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${raw}:${new Date().toISOString().slice(0,10)}`));
  const bucket = Array.from(new Uint8Array(digest)).map(n => n.toString(16).padStart(2,'0')).join('');
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data: allowed, error: limitError } = await supabaseAdmin.rpc('offramp_allow_submission', { bucket });
  if (limitError || !allowed) throw new Error('Too many requests. Please try again later.');
  const { error } = await supabaseAdmin.from('offramp_submissions').insert({ kind: data.kind, message: data.message, service_id: data.service_id ?? null, billing: data.billing ?? null, outcome: data.outcome ?? null });
  if (error) throw new Error('Could not send your message. Please try again.');
  return { ok: true };
});
