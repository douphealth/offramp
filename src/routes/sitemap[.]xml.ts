import { createFileRoute } from '@tanstack/react-router';
import { services, categories, slugify } from '@/lib/services';
export const Route = createFileRoute('/sitemap.xml')({ server: { handlers: { GET: ({ request }) => {
  const origin = new URL(request.url).origin;
  const paths = ['/', '/about', '/privacy', '/tools/calculator', ...categories.map(c => `/category/${slugify(c)}`), ...services.map(s => `/cancel/${s.id}`)];
  const escape = (s: string) => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${escape(origin + path)}</loc></url>`).join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
} } } });
