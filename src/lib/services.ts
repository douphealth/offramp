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

export type Billing = 'direct' | 'apple' | 'google' | 'partner' | 'paypal';
export const billingLabels: Record<Billing, string> = { direct: 'Service directly', apple: 'Apple App Store', google: 'Google Play', partner: 'Another provider', paypal: 'PayPal' };
export const REVIEW_DAYS = 90;
export function reviewStatus(s: Service, today = new Date()) {
  if (s.source_review_state !== 'checked' || !s.source_checked_on) return 'Reference only';
  const age = (today.getTime() - Date.parse(s.source_checked_on)) / 86400000;
  return age > REVIEW_DAYS ? 'Needs re-review' : 'Imported source review';
}
export function scopeLabel(s: Service) {
  if (s.market === 'greek') return 'Greece';
  if (s.id === 'amazon-prime' || s.region.startsWith('US')) return 'US destination';
  return 'Region varies';
}
export function filterServices(options: { q?: string; category?: string; kind?: string; market?: string; saved?: string[]; onlySaved?: boolean }) {
  return searchServices(services.filter(s => (!options.category || options.category === 'all' || s.category === options.category) && (!options.kind || options.kind === 'all' || s.route_kind === options.kind) && (!options.market || options.market === 'all' || s.market === options.market) && (!options.onlySaved || options.saved?.includes(s.id))), options.q || '');
}
export function billingOptions(s: Service): Billing[] {
  const options = s.billing.filter((b): b is Billing => ['direct','apple','google','partner'].includes(b));
  return s.id === 'paypal' ? ['paypal'] : options;
}
export function matchingRoute(s: Service, billing: Billing, region: string) {
  const platform = billing === 'apple' ? getService('apple-subscriptions') : billing === 'google' ? getService('google-play') : billing === 'paypal' ? getService('paypal') : undefined;
  if (platform) return { guide: platform, destination: platform.route, supported: true, label: billing === 'apple' ? 'Open account settings' : billing === 'paypal' ? 'Open payment settings' : 'Open subscription settings', note: `Use the ${billingLabels[billing]} purchase receipt to find ${s.name}. These are platform instructions, not a test of your individual subscription.` };
  if (billing === 'partner') return { guide: s, destination: s.source, supported: false, label: 'Read official instructions', note: 'Identify the company named on the receipt. Ask that billing provider for its cancellation process; the direct-billed steps below do not apply.' };
  if (scopeLabel(s) === 'US destination' && region !== 'US') return { guide: s, destination: s.source, supported: false, label: 'Read official instructions', note: 'The listed destination is US-specific. Use the marketplace on your receipt; another country’s cancellation route has not been reviewed here.' };
  return { guide: s, destination: s.route, supported: true, label: s.route_kind === 'help' ? 'Read official instructions' : s.route_kind === 'account' ? 'Open account settings' : 'Open cancellation page', note: 'For purchases billed directly by this service. Confirm plan and country details with the provider.' };
}
export function officialHostname(url: string) { return new URL(url).hostname; }
