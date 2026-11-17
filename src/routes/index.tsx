import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { Search, X, SlidersHorizontal, ArrowUpRight, ArrowDown, Bookmark, ShieldCheck, LockKeyhole, Music2, Tv, Dumbbell, Smartphone, Sparkles, Layers } from "lucide-react";
import { categories, filterServices, services, slugify, reviewedCount, type RouteKind } from "@/lib/services";
import { ServiceCard } from "@/components/site";
import { useSaved } from "@/lib/saved";
import { Button } from "@/components/ui/button";
import { Feedback } from "@/components/feedback";
import { trackExit } from "@/lib/analytics";
import exitScene from "@/assets/offramp-exit-scene.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Offramp — Official subscription cancellation guidance" },
      { name: "description", content: "Search 49 source-linked cancellation guides for Netflix, Spotify, ChatGPT, Greek telecoms and more. No logins, no bypasses." },
      { property: "og:title", content: "Offramp — Official subscription cancellation guidance" },
      { property: "og:description", content: "Source-linked cancellation routes, step-by-step guides and a cost calculator." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const kinds: { id: RouteKind | "all"; label: string }[] = [
  { id: "all", label: "All routes" },
  { id: "direct", label: "Shortcuts" },
  { id: "account", label: "Account" },
  { id: "help", label: "Help article" },
];

const shelfIcons = [Layers, Sparkles, Dumbbell, Music2, Smartphone, Tv];

function Index() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [kind, setKind] = useState<RouteKind | "all">("all");
  const [market, setMarket] = useState<"all" | "global" | "greek">("all");
  const [advanced, setAdvanced] = useState(false);
  const [onlySaved, setOnlySaved] = useState(false);
  const { saved, toggle } = useSaved();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) && document.activeElement !== input.current) {
        e.preventDefault(); input.current?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const list = useMemo(() => {
    return filterServices({ q, category: cat, kind, market, onlySaved, saved });
  }, [q, cat, kind, market, onlySaved, saved]);

  useEffect(() => { if (!q.trim()) return; const timer = setTimeout(() => trackExit({ kind: list.length ? 'search' : 'no_result', message: q.slice(0,100) }), 1500); return () => clearTimeout(timer); }, [q, list.length]);

  const chip = (active: boolean) =>
    `rounded-md border border-border px-3.5 py-1.5 text-sm font-medium transition ${active ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"}`;

  return (
    <div className="homepage">
      <section className="exit-hero relative overflow-hidden border-b border-border" onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return;
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--scene-x', `${((e.clientX - rect.left) / rect.width - 0.5) * 12}px`);
        e.currentTarget.style.setProperty('--scene-y', `${((e.clientY - rect.top) / rect.height - 0.5) * 8}px`);
      }} onPointerLeave={(e) => { e.currentTarget.style.setProperty('--scene-x', '0px'); e.currentTarget.style.setProperty('--scene-y', '0px'); }}>
        <img src={exitScene} alt="" width={1920} height={1024} fetchPriority="high" className="exit-scene" />
        <div className="exit-hero-content relative mx-auto max-w-6xl px-5">
          <p className="rise flex items-center gap-2 font-mono text-xs uppercase text-primary"><span className="exit-status" />offramp / the exit directory</p>
          <h1 className="rise exit-title mt-5 font-extrabold" style={{ animationDelay: "60ms" }}>
            Subscription<br />cancellation<span className="text-primary">.</span>
          </h1>
          <p className="rise mt-4 text-2xl font-semibold" style={{ animationDelay: "100ms" }}>A clearer way out.</p>
          <p className="rise mt-3 max-w-md text-base text-muted-foreground" style={{ animationDelay: "120ms" }}>
            Find your service. Choose who bills you. Get source-linked steps and the official destination. No detours.
          </p>
          <label className="rise exit-search relative mt-7 flex max-w-xl items-center rounded-lg border border-border bg-card shadow-card focus-within:ring-4 focus-within:ring-primary/20" style={{ animationDelay: "180ms" }}>
            <Search className="ml-5 h-5 w-5 text-muted-foreground" />
            <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Netflix, gym, ChatGPT, Cosmote…"
              aria-label="Search services" className="min-w-0 w-full bg-transparent px-4 py-5 text-base outline-none placeholder:text-muted-foreground" />
            {q ? (
              <Button size="icon" variant="ghost" onClick={() => setQ("")} aria-label="Clear search" className="mr-4"><X /></Button>
            ) : null}
          </label>
          <div className="rise mt-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground" style={{ animationDelay: '220ms' }}><span className="mr-1">Popular:</span>{['Netflix', 'Spotify', 'ChatGPT'].map(name => <Button key={name} variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => { setQ(name); input.current?.focus(); }}>{name}<ArrowUpRight className="h-3 w-3" /></Button>)}</div>
          <div className="rise mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" />Official source links</span><span className="inline-flex items-center gap-1.5"><LockKeyhole className="h-4 w-4 text-primary" />No logins needed</span></div>
        </div>
      </section>

      <section className="border-b border-border bg-ink text-ink-foreground">
        <div className="mx-auto grid max-w-6xl grid-cols-2 items-center gap-6 px-5 py-6 md:grid-cols-[1fr_1fr_2fr]">
          <div className="flex items-center gap-3"><span className="text-3xl font-bold text-accent">{String(services.length).padStart(2, '0')}</span><span className="text-xs">Cancellation<br />guides</span></div>
          <div className="flex items-center gap-3"><span className="text-3xl font-bold text-accent">{String(reviewedCount).padStart(2, '0')}</span><span className="text-xs">Imported<br />source reviews</span></div>
          <Link to="/about" className="col-span-2 flex items-center justify-between gap-4 border-t border-ink-foreground/20 pt-4 text-xs text-ink-foreground/75 md:col-span-1 md:border-l md:border-t-0 md:pl-6 md:pt-0"><span>Clear sources. Honest limits.<br /><span className="mt-1 inline-block">No signed-in cancellation flows have been tested.</span></span><ArrowUpRight className="h-5 w-5 shrink-0 text-accent" /></Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-12">
        <div className="mb-6 flex items-end justify-between gap-4"><div><p className="font-mono text-xs uppercase text-primary">01 / Find your service</p><h2 className="mt-2 text-3xl font-bold">Your next exit.</h2></div><ArrowDown className="h-6 w-6 text-primary" aria-hidden /></div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" aria-pressed={cat === "all"} className={chip(cat === "all")} onClick={() => setCat("all")}>Everything</Button>
          {categories.map((c) => (
            <Button variant="outline" aria-pressed={cat === c} key={c} className={chip(cat === c)} onClick={() => setCat(c)}>{c}</Button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2"><Button variant="outline" aria-expanded={advanced} onClick={() => setAdvanced(!advanced)}><SlidersHorizontal />More filters</Button><Button variant={onlySaved ? 'secondary' : 'outline'} aria-pressed={onlySaved} onClick={() => setOnlySaved(!onlySaved)}><Bookmark />Saved ({saved.length})</Button></div>
        {advanced && <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs">
          {kinds.map((k) => (
            <Button key={k.id} onClick={() => setKind(k.id)} className={`rounded-md px-2.5 py-1 ${kind === k.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-secondary"}`}>{k.label}</Button>
          ))}
          <span className="mx-2 h-4 w-px bg-border" />
          {(["all", "global", "greek"] as const).map((m) => (
            <Button key={m} onClick={() => setMarket(m)} className={`rounded-md px-2.5 py-1 ${market === m ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-secondary"}`}>{m === "all" ? "Any market" : m === "greek" ? "Greece 🇬🇷" : "Region varies"}</Button>
          ))}
          <span className="mx-2 h-4 w-px bg-border" />

        </div>}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3"><p className="font-mono text-xs text-muted-foreground" aria-live="polite">{list.length} result{list.length === 1 ? "" : "s"}</p><span className="text-xs text-muted-foreground">Source-linked. Always in your control.</span></div>
        {list.length ? (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((s, i) => <ServiceCard key={s.id} s={s} i={i} saved={saved.includes(s.id)} onToggle={() => toggle(s.id)} />)}
          </div>
        ) : (
          <div className="mt-6 rounded-[var(--radius)] border-2 border-dashed border-ink p-12 text-center">
            <p className="text-2xl font-bold">No matching guide.</p>
            <p className="mt-2 text-muted-foreground">Try removing filters or check the billing provider on your receipt. This directory does not cover every service.</p>
            <Button variant="outline" className="mt-4" onClick={() => { setQ(""); setCat("all"); setKind("all"); setMarket("all"); setOnlySaved(false); }}>Clear filters</Button><Feedback kind="request" initial={q} />
          </div>
        )}
      </section>

      <section className="mt-20 border-y border-border bg-secondary/50 py-12">
      <div className="mx-auto max-w-6xl px-5">
        <p className="font-mono text-xs uppercase text-primary">02 / Explore the directory</p>
        <h2 className="mt-2 text-3xl font-extrabold">Browse by shelf</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => {
            const n = services.filter((s) => s.category === c).length;
            const Icon = shelfIcons[i % shelfIcons.length] || Layers;
            return (
              <Link key={c} to="/category/$slug" params={{ slug: slugify(c) }} className="shelf-link group flex min-h-36 flex-col justify-between rounded-lg border border-border bg-card p-5">
                <span className="flex items-center justify-between"><Icon className="h-6 w-6 text-primary" /><span className="font-mono text-xs text-muted-foreground">{String(n).padStart(2, "0")} guides</span></span>
                <span className="mt-5 flex items-center justify-between gap-3 text-lg font-bold">{c}<ArrowUpRight className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></span>
              </Link>
            );
          })}
        </div>
      </div>
      </section>
      <section className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-5 pt-16 sm:flex-row sm:items-center"><div><p className="font-mono text-xs uppercase text-primary">Make room for what matters</p><h2 className="mt-2 text-3xl font-bold">Small charges. Bigger picture.</h2><p className="mt-3 text-muted-foreground">See what your subscriptions add up to over time.</p></div><Button asChild size="lg" className="h-12 self-start sm:self-auto"><Link to="/tools/calculator">Calculate your costs<ArrowUpRight /></Link></Button></section>
    </div>
  );
}
