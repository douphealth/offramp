import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Bookmark, BookmarkCheck, ShieldCheck } from "lucide-react";
import { edition, routeKindLabel, services, reviewedCount, type Service } from "@/lib/services";

export function Mark({ s, size = "md" }: { s: Service; size?: "md" | "lg" }) {
  const cls = size === "lg" ? "h-16 w-16 text-3xl rounded-2xl" : "h-11 w-11 text-lg rounded-xl";
  return (
    <span
      aria-hidden
      className={`${cls} inline-flex shrink-0 items-center justify-center font-bold text-ink-foreground ring-1 ring-ink/10`}
      // Brand color comes from data, so it is applied inline.
      style={{ backgroundColor: s.color }}
    >
      {s.mark}
    </span>
  );
}

export function KindBadge({ kind }: { kind: Service["route_kind"] }) {
  const tone =
    kind === "direct" ? "bg-accent text-accent-foreground" : kind === "account" ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground";
  return <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${tone}`}>{routeKindLabel[kind]}</span>;
}

export function ServiceCard({ s, saved, onToggle, i = 0 }: { s: Service; saved: boolean; onToggle: () => void; i?: number }) {
  return (
    <article
      className="rise card-lift group relative flex flex-col rounded-[var(--radius)] border-2 border-ink bg-card p-5"
      style={{ animationDelay: `${Math.min(i, 20) * 30}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <Mark s={s} />
        <button
          onClick={onToggle}
          aria-label={saved ? `Remove ${s.name} from saved` : `Save ${s.name}`}
          className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-primary"
        >
          {saved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
        </button>
      </div>
      <h3 className="mt-4 text-xl font-bold tracking-tight">{s.name}</h3>
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {s.category} · {s.market === "greek" ? "Greece" : "Global"}
      </p>
      <div className="mt-3"><KindBadge kind={s.route_kind} /></div>
      <Link
        to="/cancel/$id"
        params={{ id: s.id }}
        className="mt-5 inline-flex items-center gap-1 text-sm font-semibold after:absolute after:inset-0"
      >
        {s.steps.length}-step guide <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </article>
  );
}

export function SiteHeader() {
  const nav = [
    { to: "/", label: "Directory" },
    { to: "/tools/calculator", label: "Cost calculator" },
    { to: "/about", label: "Methodology" },
  ] as const;
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">↗</span>
          offramp<span className="text-primary">.</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: true }}
              className="hidden rounded-full px-3 py-1.5 transition hover:bg-secondary sm:inline-block data-[status=active]:bg-ink data-[status=active]:text-ink-foreground">
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t-2 border-ink bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
        <div>
          <p className="text-2xl font-extrabold">offramp<span className="text-primary">.</span></p>
          <p className="mt-2 text-sm opacity-70">An independent, source-linked directory of official subscription exits. We never cancel on your behalf and never ask for logins.</p>
        </div>
        <div className="font-mono text-xs uppercase tracking-wider opacity-80">
          <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /> Edition {edition}</p>
          <p className="mt-2">{services.length} guides · {reviewedCount} individually reviewed</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <Link to="/about" className="hover:text-primary">Methodology & sources</Link>
          <Link to="/tools/calculator" className="hover:text-primary">Subscription cost calculator</Link>
        </div>
      </div>
    </footer>
  );
}
