import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { categories, filterServices, services, slugify, reviewedCount, type RouteKind } from "@/lib/services";
import { ServiceCard } from "@/components/site";
import { useSaved } from "@/lib/saved";
import { Button } from "@/components/ui/button";
import { Feedback } from "@/components/feedback";
import { trackExit } from "@/lib/analytics";

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
    <>
      <section className="relative border-b border-border">
        <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-12 md:pt-16">
          <p className="rise font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">The exit desk · {services.length} guides · {reviewedCount} imported source reviews</p>
          <h1 className="rise mt-4 max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl" style={{ animationDelay: "60ms" }}>
            Find the official way to cancel your subscription.
          </h1>
          <p className="rise mt-6 max-w-xl text-lg text-muted-foreground" style={{ animationDelay: "120ms" }}>
            Choose who bills you. Get source-linked steps, contract cautions, and a clear official destination.
          </p>
          <label className="rise relative mt-10 flex max-w-2xl items-center rounded-lg border border-border bg-card shadow-card focus-within:ring-4 focus-within:ring-primary/30" style={{ animationDelay: "180ms" }}>
            <Search className="ml-5 h-5 w-5 text-muted-foreground" />
            <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Netflix, gym, ChatGPT, Cosmote…"
              aria-label="Search services" className="w-full bg-transparent px-4 py-5 text-lg outline-none placeholder:text-muted-foreground" />
            {q ? (
              <Button size="icon" variant="ghost" onClick={() => setQ("")} aria-label="Clear search" className="mr-4"><X /></Button>
            ) : null}
          </label>
        </div>
        <div className="mx-auto max-w-6xl px-5 pb-6 text-sm text-muted-foreground"><Link to="/about" className="underline">{reviewedCount} source reviews imported from the original edition; {services.length - reviewedCount} reference-only guides.</Link> No signed-in cancellation flows have been tested.</div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-10">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" aria-pressed={cat === "all"} className={chip(cat === "all")} onClick={() => setCat("all")}>Everything</Button>
          {categories.map((c) => (
            <Button variant="outline" aria-pressed={cat === c} key={c} className={chip(cat === c)} onClick={() => setCat(c)}>{c}</Button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2"><Button variant="outline" aria-expanded={advanced} onClick={() => setAdvanced(!advanced)}><SlidersHorizontal />More filters</Button><Button variant={onlySaved ? 'secondary' : 'outline'} aria-pressed={onlySaved} onClick={() => setOnlySaved(!onlySaved)}>Saved ({saved.length})</Button></div>
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

        <p className="mt-8 font-mono text-sm text-muted-foreground" aria-live="polite">{list.length} result{list.length === 1 ? "" : "s"}</p>
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

      <section className="mx-auto mt-20 max-w-6xl px-5">
        <h2 className="text-3xl font-extrabold tracking-tight">Browse by shelf</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => {
            const n = services.filter((s) => s.category === c).length;
            return (
              <Link key={c} to="/category/$slug" params={{ slug: slugify(c) }} className="card-lift flex items-end justify-between rounded-[var(--radius)] border-2 border-ink bg-card p-5">
                <span className="text-lg font-bold">{c}</span>
                <span className="font-mono text-3xl font-semibold text-primary">{String(n).padStart(2, "0")}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
