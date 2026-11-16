import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, AlertTriangle, CalendarCheck, Receipt, Copy, Bookmark, BookmarkCheck } from "lucide-react";
import { getService, services, slugify } from "@/lib/services";
import { KindBadge, Mark } from "@/components/site";
import { useSaved } from "@/lib/saved";

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
  const pct = Math.round((done.length / s.steps.length) * 100);
  const related = services.filter((x) => x.category === s.category && x.id !== s.id).slice(0, 4);

  return (
    <article className="mx-auto max-w-4xl px-5 py-10">
      <Link to="/" className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Directory</Link>

      <header className="rise mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
        <Mark s={s} size="lg" />
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Cancel {s.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <Link to="/category/$slug" params={{ slug: slugify(s.category) }} className="hover:text-primary">{s.category}</Link> · <span>{s.region}</span> · <KindBadge kind={s.route_kind} />
          </div>
        </div>
        <button onClick={() => toggle(s.id)} className="inline-flex items-center gap-2 rounded-full border-2 border-ink px-4 py-2 text-sm font-semibold hover:bg-secondary">
          {saved.includes(s.id) ? <><BookmarkCheck className="h-4 w-4 text-primary" /> Saved</> : <><Bookmark className="h-4 w-4" /> Save</>}
        </button>
      </header>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a href={s.route} target="_blank" rel="noopener noreferrer" className="card-lift inline-flex flex-1 items-center justify-between rounded-2xl border-2 border-ink bg-primary px-6 py-5 text-lg font-bold text-primary-foreground">
          {s.route_label} <ArrowUpRight className="h-6 w-6" />
        </a>
        <button onClick={() => { navigator.clipboard.writeText(s.route); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-ink bg-card px-5 py-5 font-semibold hover:bg-secondary">
          {copied ? <Check className="h-5 w-5 text-primary" /> : <Copy className="h-5 w-5" />} {copied ? "Copied" : "Copy link"}
        </button>
      </div>

      <section className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-extrabold">Steps</h2>
          <span className="font-mono text-sm text-muted-foreground">{done.length}/{s.steps.length} done</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} /></div>
        <ol className="mt-6 space-y-3">
          {s.steps.map((step, i) => {
            const on = done.includes(i);
            return (
              <li key={i}>
                <button onClick={() => setDone(on ? done.filter((x) => x !== i) : [...done, i])}
                  className={`flex w-full items-start gap-4 rounded-2xl border-2 p-5 text-left transition ${on ? "border-primary bg-primary/5" : "border-ink bg-card hover:bg-secondary"}`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-mono text-sm font-bold ${on ? "border-primary bg-primary text-primary-foreground" : "border-ink"}`}>{on ? <Check className="h-4 w-4" /> : i + 1}</span>
                  <span className={`pt-1 ${on ? "text-muted-foreground line-through" : ""}`}>{step}</span>
                </button>
              </li>
            );
          })}
        </ol>
        {pct === 100 && <p className="rise mt-4 rounded-2xl bg-accent p-4 font-semibold text-accent-foreground">Nice. Keep the confirmation email — it's your proof of cancellation.</p>}
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <Info icon={<AlertTriangle className="h-5 w-5 text-primary" />} title="Watch out">{s.caution}</Info>
        <Info icon={<CalendarCheck className="h-5 w-5 text-primary" />} title="What happens after">{s.after}</Info>
        <Info icon={<Receipt className="h-5 w-5 text-primary" />} title="Refunds">{s.refund_note}</Info>
      </section>

      <section className="mt-10 rounded-2xl border-2 border-dashed border-ink p-5 font-mono text-xs leading-relaxed text-muted-foreground">
        <p className="uppercase tracking-wider text-foreground">Source</p>
        <a href={s.source} target="_blank" rel="noopener noreferrer" className="mt-1 block text-sm text-primary underline">{s.source_title}</a>
        <p className="mt-2">Review state: {s.source_review_state} · checked {s.source_checked_on} · billing: {s.billing.join(", ")}</p>
      </section>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-extrabold">Also in {s.category}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <Link key={r.id} to="/cancel/$id" params={{ id: r.id }} className="card-lift flex items-center gap-3 rounded-2xl border-2 border-ink bg-card p-4 font-semibold">
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
    <div className="rounded-2xl border-2 border-ink bg-card p-5">
      <div className="flex items-center gap-2 font-bold">{icon}{title}</div>
      <p className="mt-2 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
