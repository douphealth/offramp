import { createFileRoute } from "@tanstack/react-router";
import { edition, reviewedCount, services } from "@/lib/services";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Methodology — how Offramp verifies routes" },
      { name: "description", content: "How Offramp classifies cancellation routes, reviews official sources and keeps claims checkable." },
      { property: "og:title", content: "Methodology — how Offramp verifies routes" },
      { property: "og:description", content: "Direct routes, not false promises." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const items = [
  ["Cancellation shortcut", "A provider-owned link directly related to cancellation or membership management. It is not guaranteed to open the final confirmation step."],
  ["Account starting point", "The provider's account or subscription area where cancellation normally begins after sign-in."],
  ["Official help article", "The provider's own documentation, used when no stable direct link exists."],
];

function About() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Edition {edition}</p>
      <h1 className="rise mt-3 text-5xl font-extrabold tracking-tight">Direct routes, not false promises.</h1>
      <p className="mt-6 text-lg text-muted-foreground">Offramp catalogs provider-owned subscription management and cancellation information. There is no account connection, refund service, browser bypass, or ability to cancel on your behalf. Visiting a page never means your plan is canceled — the provider's confirmation does.</p>
      <div className="mt-10 grid grid-cols-2 gap-4">
        <div className="rounded-2xl border-2 border-ink bg-card p-5"><p className="text-4xl font-extrabold text-primary">{services.length}</p><p className="font-mono text-xs uppercase">source-linked guides</p></div>
        <div className="rounded-2xl border-2 border-ink bg-card p-5"><p className="text-4xl font-extrabold text-primary">{reviewedCount}</p><p className="font-mono text-xs uppercase">individually reviewed</p></div>
      </div>
      <h2 className="mt-14 text-2xl font-extrabold">Three route classifications</h2>
      <div className="mt-4 space-y-3">
        {items.map(([t, d], i) => (
          <div key={t} className="flex gap-4 rounded-2xl border-2 border-ink bg-card p-5">
            <span className="font-mono text-2xl font-bold text-primary">0{i + 1}</span>
            <div><p className="font-bold">{t}</p><p className="mt-1 text-sm text-muted-foreground">{d}</p></div>
          </div>
        ))}
      </div>
      <h2 className="mt-14 text-2xl font-extrabold">Every claim links to its source</h2>
      <ul className="mt-4 divide-y divide-border rounded-2xl border-2 border-ink bg-card">
        {services.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
            <span className="font-semibold">{s.name}</span>
            <a href={s.source} target="_blank" rel="noopener noreferrer" className="truncate text-right text-primary underline">{s.source_title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
