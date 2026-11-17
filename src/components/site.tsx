import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowUpRight, Bookmark, BookmarkCheck, ShieldCheck, Menu, X } from 'lucide-react';
import { edition, routeKindLabel, services, reviewedCount, scopeLabel, reviewStatus, officialHostname, type Service } from '@/lib/services';
import { Button } from '@/components/ui/button';
export function Mark({ s, size = 'md' }: { s: Service; size?: 'md' | 'lg' }) {
  return <span aria-hidden className={`${size === 'lg' ? 'h-16 w-16 text-3xl' : 'h-11 w-11 text-lg'} inline-flex shrink-0 items-center justify-center rounded-lg bg-secondary font-bold text-foreground ring-1 ring-border`}>{s.mark}</span>;
}
export function KindBadge({ kind }: { kind: Service['route_kind'] }) {
  return <span className="rounded-sm bg-secondary px-2 py-1 font-mono text-[10px] text-secondary-foreground">{routeKindLabel[kind]}</span>;
}
export function ReviewBadge({ s }: { s: Service }) {
  return <Link to="/about" className="relative z-10 inline-flex items-center gap-1 text-xs text-muted-foreground underline decoration-border underline-offset-4" title="Imported source checks are not independent verification or a signed-in test."><ShieldCheck className="h-3 w-3" />{reviewStatus(s)}</Link>;
}
export function ServiceCard({ s, saved, onToggle, i = 0 }: { s: Service; saved: boolean; onToggle: () => void; i?: number }) {
  return <article className="rise card-lift group relative flex flex-col rounded-lg border border-border bg-card p-5" style={{ animationDelay: `${Math.min(i,12) * 25}ms` }}>
    <div className="flex items-start justify-between gap-3"><Mark s={s} /><Button size="icon" variant="ghost" className="relative z-20" onClick={onToggle} aria-pressed={saved} aria-label={saved ? `Remove ${s.name} from saved` : `Save ${s.name}`} title={saved ? 'Remove saved guide' : 'Save guide'}>{saved ? <BookmarkCheck className="text-primary" /> : <Bookmark />}</Button></div>
    <h3 className="mt-4 text-xl font-bold">{s.name}</h3><p className="mt-1 font-mono text-[11px] text-muted-foreground">{s.category} · {scopeLabel(s)}</p>
    <p className="mt-3 text-sm text-muted-foreground">Starts at {officialHostname(s.route)}. {s.caution.split(/(?<=\.)\s/)[0]}</p>
    <div className="mt-4"><KindBadge kind={s.route_kind} /></div><div className="mt-3"><ReviewBadge s={s} /><p className="mt-1 text-xs text-muted-foreground">Source review: {s.source_checked_on || 'Not recorded'}</p></div>
    <Link to="/cancel/$id" params={{ id: s.id }} className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold after:absolute after:inset-0">Choose billing route <ArrowUpRight className="h-4 w-4" /></Link>
  </article>;
}
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const nav = [{ to: '/', label: 'Directory' }, { to: '/tools/calculator', label: 'Cost calculator' }, { to: '/about', label: 'Methodology' }] as const;
  return <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5"><Link to="/" className="flex items-center gap-2 text-xl font-extrabold"><span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">↗</span>offramp<span className="text-primary">.</span></Link><nav aria-label="Main navigation" className="hidden items-center gap-1 sm:flex">{nav.map(n => <Button key={n.to} asChild variant="ghost"><Link to={n.to} activeOptions={{ exact: true }} className="data-[status=active]:bg-secondary">{n.label}</Link></Button>)}</nav><Button size="icon" variant="ghost" className="sm:hidden" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button></div>{open && <nav aria-label="Mobile navigation" className="flex flex-col border-t border-border px-5 py-3 sm:hidden">{nav.map(n => <Button key={n.to} asChild variant="ghost"><Link to={n.to} onClick={() => setOpen(false)}>{n.label}</Link></Button>)}</nav>}</header>;
}
export function SiteFooter() {
  return <footer className="mt-24 border-t border-border bg-ink text-ink-foreground"><div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3"><div><p className="text-2xl font-extrabold">offramp.</p><p className="mt-2 text-sm opacity-80">Independent, source-linked subscription guidance. We never cancel on your behalf or ask for your logins.</p></div><div className="text-sm opacity-80"><p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Edition {edition}</p><p className="mt-2">{services.length} guides · {reviewedCount} imported source reviews</p><p className="mt-2">Not independent verification; signed-in flows untested.</p></div><div className="flex flex-col gap-2 text-sm"><Link to="/about">Methodology & corrections</Link><Link to="/tools/calculator">Cost calculator</Link><Link to="/privacy">Privacy & feedback</Link></div></div></footer>;
}
