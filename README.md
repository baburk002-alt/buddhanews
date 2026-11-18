# Buddha News

A complete, modern, trilingual news website for **Buddha Media Group (BMG)** — rebuilt from the original single-file preview into a production newsroom.

- **Readers:** English, Pashto and Dari; RTL layouts; dark and light themes; live desk; search; article pages; newsletter; contact and source-safety guidance for tips.
- **Editors:** passwordless Manus sign-in, protected dashboard, trilingual story editor, media library, inbox, subscribers, settings and a security audit log.
- **AI:** source-grounded reader assistant, 60-second article briefs, and editor tools for headlines, summaries, SEO, tags and first-pass translation. AI never publishes on its own.
- **Design:** Fraunces + Manrope + Vazirmatn, a paper/ink/teal/saffron editorial system, Three.js globe, motion with reduced-motion support.
- **Engineering:** React 19, Vite, Tailwind 4, Express, tRPC, Drizzle ORM, MySQL, Manus OAuth, managed storage, Docker-ready production build.

> **Content note:** the database is seeded with 14 clearly written demonstration stories and AI-generated editorial illustrations so every page can be reviewed. Replace them with your own reporting and photography before a public launch. The contact address is a placeholder (`.example`) until you change it in **Newsroom → Settings**.

## Quick start

```bash
pnpm install
cp .env.example .env        # fill in the values for your environment
pnpm db:migrate             # create the tables
pnpm db:seed                # optional: load the demonstration newsroom
pnpm dev                    # http://localhost:3000
```

Production:

```bash
pnpm check                  # TypeScript
pnpm build                  # client + server bundle
pnpm start                  # serves dist/public and the API
```

## Newsroom access

Open `/admin` and sign in with the Manus account that owns this project. The project owner is promoted to administrator automatically through `OWNER_OPEN_ID`. To add another administrator, put the exact sign-in email in `ADMIN_EMAILS` (comma-separated) and redeploy; the account is promoted on its next sign-in.

There is **no automatic “first visitor becomes admin” rule**. That would let a stranger take over a new public site.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Development server with hot reload |
| `pnpm check` | TypeScript type check |
| `pnpm build` | Production client and server build |
| `pnpm start` | Run the production build |
| `pnpm db:push` | Generate and apply schema changes |
| `pnpm db:migrate` | Apply checked-in migrations |
| `pnpm db:seed` | Seed the demonstration newsroom (idempotent) |
| `pnpm test` | Test runner |

## Project map

```
client/
  index.html                 HTML shell, fonts, theme bootstrap
  public/                    favicon, manifest, route manifest, social card
  src/
    components/site/         masthead, cards, globe, ticker, search, AI, article body
    components/admin/        protected newsroom layout and UI
    contexts/                theme and trilingual dictionary
    pages/                   public pages and admin pages
    index.css                editorial design system, RTL and motion
server/
  _core/                     Express entry, OAuth, tRPC context, Vite/static serving
  db.ts                      typed data access
  routers.ts                 public and admin procedures, AI, rate limits
  seo.ts                     metadata injection, sitemap, robots, RSS
  audit.ts / rateLimit.ts    security logging and throttling
  seed.ts / seed-cli.ts      demonstration content and CLI
  storage.ts                 managed media uploads
shared/
  news.ts                    locales, categories, DTOs and shared labels
drizzle/
  schema.ts                  database schema
  *.sql                      migrations
```

## Documentation

- [Audit report](AUDIT_REPORT.md) — every defect found in the original preview and how it was fixed.
- [Security guide](SECURITY_GUIDE.md) — controls, audit events, incident response and hardening checklist.
- [Owner handbook](OWNER_HANDBOOK.md) — how to run the newsroom day to day.
- [Publishing and domain guide](PUBLISHING_AND_DOMAIN_GUIDE.md) — publish, buy/connect a domain, backups and launch checks.
- [Research notes](RESEARCH_NOTES.md) — sources and the original-site findings.

## Ownership

The application code and database schema in this repository belong to the project owner. Manus hosting, the Manus account, the domain registration and any third-party services are separate accounts and subscriptions. Exporting the code does not transfer Manus-managed OAuth, storage or database services; the publishing guide explains the supported paths and the work required for self-hosting.
