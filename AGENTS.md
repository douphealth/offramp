<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- Guide content lives in `src/data/services.json` and is read only through `src/lib/services.ts`; pages are data-driven so adding a service needs no new route.
- Keep billing matching, review expiry, scope and catalogue filtering in `src/lib/services.ts` so all pages share the same safety rules.
- Keep imported editorial reviews distinct from automated URL/source checks; automated monitoring writes alerts only, never published instructions.
- Accept public feedback only through validated, same-origin, rate-limited server functions; submissions, source hashes and editorial queues are service-role-only, while nonpersonal evidence summaries are public.
- Run evidence monitoring through the managed authenticated cron route with bounded batches; third-party failures create human review tasks rather than verified-content claims.
- Keep bookmarks device-local and treat them as untrusted optional storage; no visitor accounts are needed for public guides.
- Journey measurement is opt-in and separate from explicitly submitted feedback, so browsing remains untracked by default.
- Generate the sitemap from catalogue records and the request origin; defer production canonicals until the owner chooses the canonical domain.
