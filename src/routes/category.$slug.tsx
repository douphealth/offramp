import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { categoryBySlug, services } from "@/lib/services";
import { ServiceCard } from "@/components/site";
import { useSaved } from "@/lib/saved";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const c = categoryBySlug(params.slug);
    if (!c) throw notFound();
    return c;
  },
  head: ({ loaderData: c }) => {
    const title = `Cancel ${c ?? ""} subscriptions | Offramp`;
    const desc = `Official cancellation routes for ${c} services.`;
    return { meta: [{ title }, { name: "description", content: desc }, { property: "og:title", content: title }, { property: "og:description", content: desc }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
  },
  component: Category,
});

function Category() {
  const c = Route.useLoaderData();
  const list = services.filter((s) => s.category === c);
  const { saved, toggle } = useSaved();
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <Link to="/" className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Directory</Link>
      <h1 className="rise mt-6 text-5xl font-extrabold tracking-tight">{c}</h1>
      <p className="mt-2 font-mono text-sm text-muted-foreground">{list.length} mapped exits</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((s, i) => <ServiceCard key={s.id} s={s} i={i} saved={saved.includes(s.id)} onToggle={() => toggle(s.id)} />)}
      </div>
    </div>
  );
}
