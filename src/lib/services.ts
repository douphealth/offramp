import data from "@/data/services.json";

export type RouteKind = "direct" | "account" | "help";
export interface Service {
  id: string; name: string; category: string; mark: string; color: string; aliases: string;
  route: string; route_label: string; route_kind: RouteKind; source: string; source_title: string;
  steps: string[]; caution: string; after: string; billing: string[];
  source_review_state: string; source_checked_on: string; market: "global" | "greek";
  region: string; market_label: string; refund_note: string;
  friction_flags?: string[]; clicks_observed?: number | null; authenticated_flow_tested?: boolean;
}

export const edition: string = data.edition;
export const services = data.services as Service[];
export const reviewedCount: number = data.individually_reviewed;

export const slugify = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export const categories = Array.from(new Set(services.map((s) => s.category))).sort();
export const categoryBySlug = (slug: string) => categories.find((c) => slugify(c) === slug);
export const getService = (id: string) => services.find((s) => s.id === id);

export const routeKindLabel: Record<RouteKind, string> = {
  direct: "Cancellation shortcut",
  account: "Account starting point",
  help: "Official help article",
};

/** Ranked fuzzy-ish search over name, aliases and category. */
export function searchServices(list: Service[], q: string): Service[] {
  const t = q.trim().toLowerCase();
  if (!t) return list;
  return list
    .map((s) => {
      const n = s.name.toLowerCase();
      let score = 0;
      if (n === t) score = 100;
      else if (n.startsWith(t)) score = 80;
      else if (n.includes(t)) score = 60;
      else if (s.aliases.toLowerCase().includes(t)) score = 40;
      else if (s.category.toLowerCase().includes(t)) score = 20;
      return { s, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.s);
}
