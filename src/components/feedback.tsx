import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { MessageSquare, Send, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { submitFeedback } from '@/lib/submissions.functions';
import type { Submission } from '@/lib/submissions';
export function Feedback({ kind, serviceId, initial = '' }: { kind: 'issue' | 'request'; serviceId?: string; initial?: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(initial);
  const [state, setState] = useState('');
  const send = useServerFn(submitFeedback);
  return <div className="mt-4">
    <Button variant="outline" onClick={() => setOpen(!open)} aria-expanded={open}><MessageSquare />{kind === 'issue' ? 'Report an issue' : 'Request a service'}</Button>
    {open && <form className="mt-4 space-y-3" onSubmit={async e => { e.preventDefault(); setState('Sending'); try { await send({ data: { kind, service_id: serviceId, message } }); setState('Sent — thank you. Your message is awaiting review.'); } catch (error) { setState(error instanceof Error ? error.message : 'Please try again.'); } }}>
      <label className="block text-sm font-semibold" htmlFor={`feedback-${serviceId || kind}`}>{kind === 'issue' ? 'What changed or went wrong?' : 'Which service is missing?'}</label>
      <textarea id={`feedback-${serviceId || kind}`} required minLength={5} maxLength={2000} value={message} onChange={e => setMessage(e.target.value)} className="min-h-24 w-full rounded-md border border-border bg-card p-3" />
      <p className="text-xs text-muted-foreground">Do not include passwords, account numbers, receipts, or financial documents. No reply address is collected.</p>
      <Button type="submit" disabled={state === 'Sending' || state.startsWith('Sent')}><Send />Send message</Button>
      <p role="status" className="text-sm">{state}</p>
    </form>}
  </div>;
}
export function Outcome({ serviceId, billing }: { serviceId: string; billing: Submission['billing'] }) {
  const [state, setState] = useState('');
  const send = useServerFn(submitFeedback);
  return <section className="mt-10 border-t border-border pt-6"><h2 className="text-lg font-bold">Did these instructions work?</h2><div className="mt-3 flex flex-wrap gap-2">{(['yes','no','unsure'] as const).map(outcome => <Button key={outcome} variant="outline" disabled={state === 'Sending' || state === 'Thank you — feedback received.'} onClick={async () => { setState('Sending'); try { await send({ data: { kind: 'outcome', service_id: serviceId, billing, outcome } }); setState('Thank you — feedback received.'); } catch { setState('Could not send feedback. Please try again.'); } }}>{outcome === 'yes' && <Check />}{outcome === 'yes' ? 'Yes' : outcome === 'no' ? 'No' : 'Not sure'}</Button>)}</div><p role="status" className="mt-2 text-sm text-muted-foreground">{state}</p></section>;
}
