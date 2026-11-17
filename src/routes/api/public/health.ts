import { createFileRoute } from '@tanstack/react-router';
import { services } from '@/lib/services';
export const Route = createFileRoute('/api/public/health')({ server: { handlers: { GET: () => Response.json({ status: 'ok', guide_count: services.length }, { headers: { 'Cache-Control': 'no-store' } }) } } });
