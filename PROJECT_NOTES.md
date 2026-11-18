# Buddha News — architecture notes

## Stack and commands

- React 19 + Vite 7 + Tailwind 4 + wouter + Framer Motion + Three.js.
- Express + tRPC 11 + Drizzle ORM + MySQL (TiDB-compatible managed database).
- `pnpm dev` on port 3000; `pnpm build`; `pnpm start`; `pnpm check`; `pnpm db:migrate`; `pnpm db:seed`.
- `dist/index.js` is the production server bundle; `dist/public/` is the client build.

## Data model

`users`, `articles`, `article_translations`, `article_views`, `audit_logs`, `media_assets`, `newsletter_subscribers`, `contact_messages`, `site_settings`.

The seed creates 14 stories with EN/PS/FA translations. `server/seed.ts` is import-safe; the CLI lives in `server/seed-cli.ts` (important: bundling a CLI guard into `dist/index.js` previously called `process.exit(0)`).

## Auth and security

- Manus OAuth; owner promoted by `OWNER_OPEN_ID`; additional admins via `ADMIN_EMAILS`.
- No automatic first-visitor admin bootstrap.
- `adminProcedure` guards every admin tRPC route.
- Audit entries for login/logout, article/media/settings/message changes and AI actions.
- Helmet production CSP with a hash for the inline theme bootstrap.
- DOMPurify + marked for article bodies; upload MIME/magic-byte validation.
- In-memory rate limits: API 300/min, contact/tip 4/hour, newsletter 6/hour, public AI 20/hour, brief 12/hour, editor AI 40/hour.

## SEO

`server/seo.ts` injects title/description/OG/Twitter/canonical/JSON-LD. It must parse `req.originalUrl` because `req.path` is `/` inside the Express wildcard fallback. `PUBLIC_SITE_URL` is required for absolute canonical/JSON-LD/sitemap URLs. `sitemap.xml`, `robots.txt`, `rss.xml` are registered in `server/_core/index.ts`.

## Frontend

- Design tokens and prose styles in `client/src/index.css`.
- Public pages under `client/src/pages`; admin pages lazy-loaded in `App.tsx`.
- Globe is a lazy Three.js chunk in `client/src/components/three/GlobeScene.tsx`.
- `ArticleBody` renders sanitized Markdown; do not replace it with a heavy Streamdown/Mermaid renderer for article pages.
- I18n dictionary and locale persistence in `client/src/contexts/I18nContext.tsx`.

## Assets

Managed images are referenced through `/manus-storage/...`; the server redirects to signed URLs. Seed image keys are in `server/seed.ts`. Demo images are AI-generated and should be replaced before launch.

## Release package

`release/buddha-news-source.zip` (source/docs) and `release/buddha-news-database.sql.gz` (schema + demo data) are generated for delivery. Do not commit secrets into either.
