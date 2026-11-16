import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { Search, X, Command } from "lucide-react";
import { categories, searchServices, services, slugify, reviewedCount, type RouteKind } from "@/lib/services";
import { ServiceCard, Mark } from "@/components/site";
import { useSaved } from "@/lib/saved";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Offramp — Find the official exit for any subscription" },
      { name: "description", content: "Search 49 source-linked cancellation guides for Netflix, Spotify, ChatGPT, Greek telecoms and more. No logins, no bypasses." },
      { property: "og:title", content: "Offramp — Find the official exit for any subscription" },
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
    let l = services.filter((s) =>
      (cat === "all" || s.category === cat) && (kind === "all" || s.route_kind === kind) &&
      (market === "all" || s.market === market) && (!onlySaved || saved.includes(s.id)));
    return searchServices(l, q);
  }, [q, cat, kind, market, onlySaved, saved]);

  const chip = (active: boolean) =>
    `rounded-full border-2 border-ink px-3.5 py-1.5 text-sm font-medium transition ${active ? "bg-ink text-ink-foreground" : "bg-card hover:bg-secondary"}`;

  return (
    <>
      <section className="relative overflow-hidden border-b-2 border-ink bg-grain">
        <div className="pointer-events-none absolute inset-0 bg-glow" />
        <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-16 md:pt-24">
          <p className="rise font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">The exit desk · {services.length} guides · {reviewedCount} reviewed</p>
          <h1 className="rise mt-4 max-w-4xl text-5xl font-extrabold leading-[0.95] tracking-tight md:text-7xl" style={{ animationDelay: "60ms" }}>
            Every subscription has an exit. <span className="text-primary">We map it.</span>
          </h1>
          <p className="rise mt-6 max-w-xl text-lg text-muted-foreground" style={{ animationDelay: "120ms" }}>
            Official, source-linked cancellation routes — with the steps, the traps and what happens after. No logins, no bypasses, no fake promises.
          </p>
          <label className="rise relative mt-10 flex max-w-2xl items-center rounded-2xl border-2 border-ink bg-card shadow-[var(--shadow-pop)] focus-within:ring-4 focus-within:ring-primary/30" style={{ animationDelay: "180ms" }}>
            <Search className="ml-5 h-5 w-5 text-muted-foreground" />
            <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Netflix, gym, ChatGPT, Cosmote…"
              aria-label="Search services" className="w-full bg-transparent px-4 py-5 text-lg outline-none placeholder:text-muted-foreground" />
            {q ? (
              <button onClick={() => setQ("")} aria-label="Clear" className="mr-4 rounded-full p-1 hover:bg-secondary"><X className="h-5 w-5" /></button>
            ) : (
              <kbd className="mr-5 hidden items-center gap-1 rounded-md border border-border px-2 py-1 font-mono text-xs text-muted-foreground sm:flex"><Command className="h-3 w-3" />K</kbd>
            )}
          </label>
        </div>
        <div className="relative overflow-hidden border-t-2 border-ink bg-ink py-3">
          <div className="marquee flex w-max gap-3">
            {[...services, ...services].map((s, i) => (
              <Link key={i} to="/cancel/$id" params={{ id: s.id }} className="flex items-center gap-2 rounded-full bg-ink-foreground/10 py-1 pl-1 pr-3 text-sm text-ink-foreground hover:bg-primary">
                <span className="scale-75"><Mark s={s} /></span>{s.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-10">
        <div className="flex flex-wrap gap-2">
          <button className={chip(cat === "all")} onClick={() => setCat("all")}>Everything</button>
          {categories.map((c) => (
            <button key={c} className={chip(cat === c)} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider">
          {kinds.map((k) => (
            <button key={k.id} onClick={() => setKind(k.id)} className={`rounded-md px-2.5 py-1 ${kind === k.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-secondary"}`}>{k.label}</button>
          ))}
          <span className="mx-2 h-4 w-px bg-border" />
          {(["all", "global", "greek"] as const).map((m) => (
            <button key={m} onClick={() => setMarket(m)} className={`rounded-md px-2.5 py-1 ${market === m ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-secondary"}`}>{m === "all" ? "Any market" : m === "greek" ? "Greece 🇬🇷" : "Global"}</button>
          ))}
          <span className="mx-2 h-4 w-px bg-border" />
          <button onClick={() => setOnlySaved(!onlySaved)} className={`rounded-md px-2.5 py-1 ${onlySaved ? "bg-accent text-accent-foreground" : "bg-muted hover:bg-secondary"}`}>Saved ({saved.length})</button>
        </div>

        <p className="mt-8 font-mono text-sm text-muted-foreground" aria-live="polite">{list.length} result{list.length === 1 ? "" : "s"}</p>
        {list.length ? (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((s, i) => <ServiceCard key={s.id} s={s} i={i} saved={saved.includes(s.id)} onToggle={() => toggle(s.id)} />)}
          </div>
        ) : (
          <div className="mt-6 rounded-[var(--radius)] border-2 border-dashed border-ink p-12 text-center">
            <p className="text-2xl font-bold">No exit mapped yet.</p>
            <p className="mt-2 text-muted-foreground">Check your bank statement for the billing partner — Apple, Google Play or PayPal often own the subscription.</p>
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
