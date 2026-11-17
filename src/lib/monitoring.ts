export function needsEvidenceReview(routeStatus: number | null, sourceStatus: number | null, changed: boolean) {
  return changed || routeStatus === null || sourceStatus === null || routeStatus >= 400 || sourceStatus >= 400;
}
export function sourceText(html: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
