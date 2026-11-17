# Offramp

Source-linked, billing-aware subscription cancellation navigator. Imported guide content is not represented as independently verified. No visitor accounts, financial document uploads, AI-generated guidance, or cancellation-on-behalf service.

## Development

Install dependencies with `bun install`, run `bun run dev`, and run tests with `bun run test`. TanStack Start / React / Tailwind; server logic is Worker-compatible. Guide content is source-controlled in `src/data/services.json`, accessed only through `src/lib/services.ts`.

## Evidence maintenance

- Public guide status derives from the imported editorial date; reviews expire after 90 days. The importer records no identifiable reviewers. Do not invent one.
- Daily authenticated `/api/public/check-evidence` checks six guides; the whole catalogue cycles every nine days. Fetches are bounded to six concurrent calls. HTTP failures and blocked sites are alerts, not proof of a broken cancellation flow.
- `offramp_evidence` is a public nonpersonal summary. `offramp_source_history` stores private text fingerprints. Text changes can be caused by dynamic site chrome; human review is mandatory.
- `offramp_review_queue` is private. New alerts receive a seven-day deadline and no invented owner. Assign a real editor in Cloud, compare the official source and plan/billing/jurisdiction scope, record material claims and source/date in the data, then approve a reviewed Git change. Never auto-publish research. Alert approval alone does not update guide content.
- Requests, correction reports, and outcomes enter `offramp_submissions`, readable only by privileged Cloud tooling. Visitors submit through a validated same-origin rate-limited function. Four intentionally private tables have RLS with no visitor policies. No client admin privileges or public admin screens.
- Optional journey measurement is off by default. Searches (first 100 characters), billing choices and outbound clicks are recorded only after consent; explicitly submitted reports/outcomes do not require analytics consent. An outbound click never means cancellation succeeded.

## Recovery and rollback rehearsal

1. Retain a reviewed Git commit before editing a guide. To roll back, create a new commit restoring that known-good JSON record (do not rewrite Git history), run safety tests, preview it, then publish that version.
2. Export the private operational tables through approved Cloud tooling before maintenance. Keep exports private; never put feedback data in the public repository.
3. Restore exported operational rows in a test environment first, verify row counts and public/anonymous access boundaries, then repeat via approved Cloud tools only after confirmation. Published guide recovery is independent of operational table recovery.
4. Monitor `/api/public/health` using an external uptime monitor. A healthy response verifies the app endpoint, not every source or Cloud availability.
5. Managed schedules target the published application. Publish and inspect the first completed run before claiming hosted monitoring is operating.

## Launch gates: remaining external requirements

- Provide an identifiable publisher, direct contact and editorial owner assignments; imported review dates do not provide these.
- Complete human reviews of reference-only guides and any complex contract/billing claims; the original three-step records have not been expanded with invented instructions.
- Set a custom domain and production canonical origin; `/sitemap.xml` uses the serving origin, unique leaf metadata exists, real unknown routes return not-found, and filter query URLs are excluded in robots. Verify public publishing visibility, crawlability and canonical tags after choosing the domain.
- Connect an external uptime monitor; verify the scheduled callback on the published deployment.
- Measure real hosted mobile LCP ≤2.5s, INP ≤200ms, CLS ≤0.1; local/browser checks are not a field-performance certification.
- Rehearse operational-table restoration with an approved backup and account. Source rollback is covered by tests and versioned records; a real production data restore has not been performed.
- Establish feedback retention/deletion and identify operational-log retention before public launch. Daily IP hashes are eligible for cleanup after two days by the daily job; verify its first published run.
- Decide publisher privacy/commercial disclosures and repeat a hosted security review. Passing tests is not an enterprise certification.
