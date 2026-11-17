import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { estimateCosts, type CostRow } from "@/lib/calculator";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/tools/calculator")({
  head: () => ({
    meta: [
      { title: "Subscription cost calculator | Offramp" },
      { name: "description", content: "Add your subscriptions and see what they really cost per month, per year and over five years." },
      { property: "og:title", content: "Subscription cost calculator | Offramp" },
      { property: "og:description", content: "See the true yearly and 5-year cost of your subscriptions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Calculator,
});

type Row = CostRow;

function Calculator() {
  const [rows, setRows] = useState<Row[]>([
    { name: "Streaming", price: 13.99, cycle: "month" },
    { name: "Music", price: 10.99, cycle: "month" },
    { name: "Cloud storage", price: 29.99, cycle: "year" },
  ]);
  const { monthly } = estimateCosts(rows);
  const set = (i: number, p: Partial<Row>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...p } : r)));
  const fmt = (n: number) => n.toLocaleString("en-IE", { style: "currency", currency: "EUR" });

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="rise text-4xl font-extrabold tracking-tight">Subscription cost calculator</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">Estimated recurring spend at today’s prices, with no price increases assumed. Refunds, cancellation fees, notice periods and contractual obligations are excluded.</p>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-ink bg-card p-3">
              <input aria-label="Name" value={r.name} onChange={(e) => set(i, { name: e.target.value })} className="min-w-0 flex-1 bg-transparent px-2 py-2 font-semibold outline-none" />
              <input aria-label="Price" type="number" min={0} step="0.01" value={r.price} onChange={(e) => set(i, { price: Math.max(0, Number(e.target.value)) })} className="w-24 rounded-lg bg-muted px-3 py-2 font-mono outline-none" />
              <select aria-label="Billing cycle" value={r.cycle} onChange={(e) => set(i, { cycle: e.target.value as Row["cycle"] })} className="rounded-lg bg-muted px-3 py-2 outline-none">
                <option value="month">/ month</option><option value="year">/ year</option>
              </select>
              <Button variant="outline" aria-label="Remove" onClick={() => setRows(rows.filter((_, j) => j !== i))} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          <Button variant="outline" onClick={() => setRows([...rows, { name: "New subscription", price: 9.99, cycle: "month" }])} className="inline-flex items-center gap-2 rounded-lg border border-dashed border-ink px-4 py-3 font-semibold hover:bg-secondary"><Plus className="h-4 w-4" /> Add subscription</Button>
        </div>
        <aside className="h-fit rounded-lg border border-ink bg-ink p-6 text-ink-foreground shadow-[var(--shadow-pop)] lg:sticky lg:top-24">
          <Stat label="Per month" v={fmt(monthly)} />
          <Stat label="Per year" v={fmt(monthly * 12)} />
          <Stat label="Over 5 years" v={fmt(monthly * 60)} big />
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, v, big }: { label: string; v: string; big?: boolean }) {
  return (
    <div className="border-b border-ink-foreground/15 py-4 last:border-0">
      <p className="font-mono text-xs uppercase tracking-wider opacity-70">{label}</p>
      <p className={`font-extrabold tabular-nums ${big ? "text-4xl text-primary" : "text-2xl"}`}>{v}</p>
    </div>
  );
}
