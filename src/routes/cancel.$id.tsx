import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, AlertTriangle, CalendarCheck, Receipt, Copy, Bookmark, BookmarkCheck } from "lucide-react";
import { getService, services, slugify, billingOptions, billingLabels, matchingRoute, scopeLabel, officialHostname, type Billing } from "@/lib/services";
import { KindBadge, Mark, ReviewBadge } from "@/components/site";
import { useSaved } from "@/lib/saved";
import { Button } from "@/components/ui/button";
import { Feedback, Outcome } from "@/components/feedback";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { trackExit } from "@/lib/analytics";

export const Route = createFileRoute("/cancel/$id")({
  loader: ({ params }) => {
    const s = getService(params.id);
    if (!s) throw notFound();
    return s;
  },
  head: ({ loaderData: s }) => {
    const title = s ? `How to cancel ${s.name} — official steps | Offramp` : "Guide not found | Offramp";
    const desc = s ? `${s.steps.length} source-linked steps to cancel ${s.name}, plus billing traps and what happens after.` : "";
    return { meta: [{ title }, { name: "description", content: desc }, { property: "og:title", content: title }, { property: "og:description", content: desc }, { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary_large_image" }] };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-5 py-24 text-center"><h1 className="text-4xl font-extrabold">Guide not found</h1><Link to="/" className="mt-6 inline-block text-primary underline">Back to the directory</Link></div>
  ),
  component: Guide,
});

function Guide() {
  const s = Route.useLoaderData();
  const [done, setDone] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const { saved, toggle } = useSaved();
  const [billing, setBilling] = useState<Billing | ''>('');
  const [region, setRegion] = useState(s.market === 'greek' ? 'Greece' : '');
  const [linkEvidence, setLinkEvidence] = useState<{ link_checked_at: string; needs_review: boolean } | null>(null);
  const [copyError, setCopyError] = useState('');
  useEffect(() => { setDone([]); setBilling(''); setRegion(s.market === 'greek' ? 'Greece' : ''); setLinkEvidence(null); }, [s.id, s.market]);
  useEffect(() => { let active = true; supabase.from('offramp_evidence').select('link_checked_at, needs_review').eq('service_id',s.id).maybeSingle().then(({ data }) => { if (active) setLinkEvidence(data); }); return () => { active = false; }; }, [s.id]);
  const match = billing ? matchingRoute(s, billing, region) : null;
  const guide = match?.guide || s;
  const showSteps = Boolean(match?.supported);
  const pct = Math.round((done.length / guide.steps.length) * 100);
  const related = services.filter((x) => x.category === s.category && x.id !== s.id).slice(0, 4);

  return (
    <article className="mx-auto max-w-4xl px-5 py-10">
      <Link to="/" className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Directory</Link>

      <header className="rise mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
        <Mark s={s} size="lg" />
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold  md:text-5xl">Cancel {s.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <Link to="/category/$slug" params={{ slug: slugify(s.category) }} className="hover:text-primary">{s.category}</Link> · <span>{scopeLabel(s)}</span> · <KindBadge kind={s.route_kind} />
          </div>
        </div>
        <Button onClick={() => toggle(s.id)} className="inline-flex items-center gap-2 rounded-full border-2 border-border px-4 py-2 text-sm font-semibold hover:bg-secondary">
          {saved.includes(s.id) ? <><BookmarkCheck className="h-4 w-4 text-primary" /> Saved</> : <><Bookmark className="h-4 w-4" /> Save</>}
        </Button>
      </header>

      <section className="mt-8 border-y border-border py-6">
        <h2 className="text-2xl font-extrabold">Who bills you?</h2>
        <div className="mt-4 flex flex-wrap gap-2">{billingOptions(s).map(b => <Button key={b} variant={billing === b ? 'default' : 'outline'} aria-pressed={billing === b} onClick={() => { setBilling(b); setDone([]); trackExit({ kind: "billing", service_id: s.id, billing: b }); }}>{b === 'direct' ? s.name : billingLabels[b]}</Button>)}</div>
        <details className="mt-4 text-sm"><summary className="cursor-pointer font-semibold">I’m not sure who bills me</summary><p className="mt-2 text-muted-foreground">Check the seller on your original receipt or the subscription section of your account. An Apple receipt means Apple; a Google Play receipt means Google Play. A card charge alone may not identify the subscription owner. Check other accounts if the subscription is missing. Never upload receipts or bank statements here.</p><p className="mt-2 text-muted-foreground">If you pay with PayPal, stopping its automatic payment does not necessarily end your merchant contract. Confirm cancellation with the merchant too.</p></details>
        <label className="mt-5 block text-sm font-semibold" htmlFor="guide-region">Billing region</label><select id="guide-region" value={region} onChange={e => { setRegion(e.target.value); setDone([]); }} className="mt-2 w-full rounded-md border border-border bg-card p-3 sm:w-72"><option value="">Choose region</option><option value="Greece">Greece</option><option value="US">United States</option><option value="Other">Other / region varies</option></select>
        <p className="mt-2 text-xs text-muted-foreground">Region selection does not imply a local legal or refund review. {s.market_label}.</p>
      </section>
      {match && <div className="sticky top-16 z-30 -mx-5 border-b border-border bg-background/95 px-5 py-4 backdrop-blur sm:static sm:mx-0 sm:px-0"><p className="mb-2 text-sm font-semibold">{billing ? billingLabels[billing] : ''} · {region || 'Region not selected'}</p><div className="flex flex-wrap gap-2"><Button asChild size="lg" className="h-auto min-h-12 max-w-full whitespace-normal"><a href={match.destination} onClick={() => { if (billing) trackExit({ kind: "outbound", service_id: s.id, billing }); }} target="_blank" rel="noopener noreferrer">{match.label}<ArrowUpRight /></a></Button><Button variant="outline" size="icon" title="Copy official link" aria-label="Copy official link" onClick={async () => { try { await navigator.clipboard.writeText(match.destination); setCopied(true); setCopyError(''); setTimeout(() => setCopied(false),1500); } catch { setCopyError('Copy unavailable. Open the official destination instead.'); } }}>{copied ? <Check /> : <Copy />}</Button></div><p className="mt-2 break-all font-mono text-xs text-muted-foreground">{officialHostname(match.destination)}</p><p role="status" className="text-sm">{copyError}</p></div>}
      {match && <p className="mt-4 text-sm text-muted-foreground">{match.note}</p>}

      {showSteps && <section className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-extrabold">Steps</h2>
          <span className="font-mono text-sm text-muted-foreground">{done.length}/{guide.steps.length} done</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} /></div>
        <ol className="mt-6 space-y-3">
          {guide.steps.map((step, i) => {
            const on = done.includes(i);
            return (
              <li key={i}>
                <Button variant="outline" aria-pressed={on} onClick={() => setDone(on ? done.filter((x) => x !== i) : [...done, i])}
                  className={`h-auto whitespace-normal justify-start flex w-full items-start gap-4 rounded-lg border p-5 text-left transition ${on ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-secondary"}`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-mono text-sm font-bold ${on ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{on ? <Check className="h-4 w-4" /> : i + 1}</span>
                  <span className={`pt-1 ${on ? "text-muted-foreground line-through" : ""}`}>{step}</span>
                </Button>
              </li>
            );
          })}
        </ol>
        {pct === 100 && <p className="rise mt-4 rounded-2xl bg-accent p-4 font-semibold text-accent-foreground">Nice. Keep the confirmation email — it's your proof of cancellation.</p>}
      </section>}

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <Info icon={<AlertTriangle className="h-5 w-5 text-primary" />} title="Watch out">{guide.caution}</Info>
        <Info icon={<CalendarCheck className="h-5 w-5 text-primary" />} title="What happens after">{guide.after}</Info>
        <Info icon={<Receipt className="h-5 w-5 text-primary" />} title="Refunds">{guide.refund_note}</Info>
      </section>

      <section className="mt-10 break-words rounded-lg border border-dashed border-border p-5 font-mono text-xs leading-relaxed text-muted-foreground">
        <p className="uppercase tracking-wider text-foreground">Evidence & scope</p><div className="mt-2"><ReviewBadge s={guide} /></div>
        <a href={guide.source} target="_blank" rel="noopener noreferrer" className="mt-1 block break-words text-sm text-primary underline">{guide.source_title}</a>
        <p className="mt-2">Source review recorded in imported edition: {guide.source_checked_on || "Not recorded"}. Reviewer identity: not supplied. Signed-in flow: not tested.</p>
        <p className="mt-2">Link check: {linkEvidence ? new Date(linkEvidence.link_checked_at).toLocaleDateString('en-GB') : 'No automated result recorded'}. {linkEvidence?.needs_review ? 'Needs manual re-review.' : 'A working link does not verify the instructions.'}</p>
        <p className="mt-2">Source supports this guide’s steps and cautions at the recorded review date; individual fees, notice periods, data retention and credit terms are not independently determined unless stated. Confirm those details with your plan provider.</p>
      </section>
      <section className="mt-8 border-t border-border pt-6"><h2 className="text-xl font-bold">Confirm the cancellation</h2><p className="mt-2 text-sm text-muted-foreground">Check the renewal status and end date in the billing provider’s account. Keep the confirmation email, cancellation reference, and any written fee or equipment-return terms. Ticking steps here or opening a link does not cancel anything.</p><Feedback kind="issue" serviceId={s.id} /></section>
      {billing && <Outcome key={`${s.id}-${billing}`} serviceId={s.id} billing={billing} />}

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-extrabold">Also in {s.category}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <Link key={r.id} to="/cancel/$id" params={{ id: r.id }} className="card-lift flex items-center gap-3 rounded-lg border border-border bg-card p-4 font-semibold">
                <Mark s={r} /> {r.name} <ArrowUpRight className="ml-auto h-4 w-4" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function Info({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 font-bold">{icon}{title}</div>
      <p className="mt-2 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
