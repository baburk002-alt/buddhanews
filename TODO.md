# Buddha News — Delivery Checklist

## 1. Newsroom database and seed content
- [x] Schema covers articles, three-locale translations, views, media, audit logs, subscribers, contact messages and settings. Evidence: `drizzle/schema.ts`, migration applied.
- [x] Idempotent seed publishes 14 stories across all eight categories, each with EN/PS/FA title, summary and body. Evidence: `server/seed.ts`, `server/seed-cli.ts`, database counts 14 articles / 42 translations.
- [x] Seed preserves the original category tree (Afghanistan, World, Business, Sports, Art & Culture, Opinions, Special Events, Videos) and fixes the old duplicate/global subcategory keys. Evidence: `shared/news.ts`.

## 2. Public trilingual experience
- [x] English, Pashto and Dari switch instantly, persist across visits, set `lang`/`dir`, and fall back to English with a visible notice when a translation is missing.
- [x] Home page has breaking ticker, 3D globe hero, lead story, secondary stories, latest grid, most-read rail, category bands, AI briefing, live stream and newsletter.
- [x] Article pages render full Markdown safely, reading progress, share actions, AI 60-second brief, tags, author and related stories. Evidence: `ArticleBody` with marked + DOMPurify.
- [x] Category, search, about, contact, tip line, privacy, terms and editorial-policy pages are complete; unknown routes return a real 404 page.
- [x] All eight categories and every original subcategory are reachable from navigation and filter correctly by exact category/subcategory.

## 3. Modern design, fonts, motion and 3D
- [x] Google Fonts Fraunces + Manrope + Vazirmatn are loaded with preconnect and correct RTL fallback.
- [x] Asymmetric editorial layout, saffron/ink/teal design tokens, light and dark themes, responsive from 360 px to desktop.
- [x] Three.js globe hero with orbital ring and particles; graceful static fallback and reduced-motion support.
- [x] Framer Motion reveals, ticker marquee and micro-interactions do not block reading or harm performance; globe/admin routes are lazy-loaded.

## 4. AI newsroom
- [x] Public "Ask Buddha AI" answers questions about current stories with locale-aware replies, rate limits and a clear AI disclaimer.
- [x] Article AI brief is generated on demand and cached per translation.
- [x] Admin AI actions draft headlines, summaries, SEO metadata, tags and full Pashto/Dari translations.

## 5. Owner dashboard and editing
- [x] Secure admin area lists dashboard stats, articles, media, audit log, messages and subscribers.
- [x] Article editor supports create/edit/publish/unpublish/delete, cover image, category/subcategory, tags, featured/breaking flags, SEO fields and three language tabs with live Markdown preview.
- [x] Media upload accepts JPEG/PNG/WebP up to 5 MB and stores durable URLs; settings page edits site name, tagline, live stream URL and tip-line details.
- [x] Non-admin visitors cannot see or call any admin feature. Evidence: server-side `adminProcedure`; browser-tested owner dashboard.

## 6. Security, privacy and reliability
- [x] Helmet security headers, production CSP, Origin checks, Zod validation, upload validation and rate limits are active.
- [x] Login, article changes, media uploads, settings changes and admin AI actions append to an audit log with actor and request metadata for privileged admin activity; public contact/tip source metadata is excluded.
- [x] Session cookie is HttpOnly, Secure, SameSite=None for Preview, and the signed session is limited to seven days; logout clears it and older tokens without an issuance time are rejected; admin routes are `noindex`.
- [x] Newsletter and contact forms validate input, rate-limit abuse and never expose private data publicly.
- [x] Health endpoint, graceful 404, error boundary and database-failure messages are in place.

## 7. SEO and sharing
- [x] Home, article, category and search routes receive server-injected title, description, canonical/OG/Twitter metadata where applicable; article pages add NewsArticle JSON-LD and home adds WebSite JSON-LD when `PUBLIC_SITE_URL` is configured.
- [x] `sitemap.xml`, `robots.txt` and RSS feed are served from live data; admin and API paths are disallowed.
- [x] `<noscript>` article fallback contains readable content; unknown article slugs return HTTP 404.

## 8. Complete ownership package
- [x] Audit report lists every defect found in the uploaded preview file and its fix.
- [x] Owner handbook explains editing, publishing, backups, AI, roles and routine maintenance in plain language.
- [x] Security guide covers hardening, logging, backups, incident response and account recovery.
- [x] Publishing and domain guide covers Manus publishing, buying/connecting a domain, DNS/SSL, costs, self-hosting limits and long-term hosting choices.
- [x] Source ZIP, database dump and all guides are delivered together.

## 9. Whistleblower privacy and launch hardening
- [x] Contact submissions persist `null` rather than the sender's IP address. The anonymous-audit helper writes `null` for both IP and User-Agent (it currently has no callers). IP-based rate-limit keys may remain transient in memory but are not written to contact/source records.
- [x] New admin sessions expire no later than seven days; both signed-token expiration and cookie lifetime enforce that limit, tokens carry an issuance time, and tokens without a valid issuance time or older than seven days are rejected.
- [x] TipLine and Contact guidance tells high-risk sources not to enter sensitive material into website forms or ordinary email; it directs them to an independently verified Signal channel, says to enable disappearing messages, and mentions Tor Browser without promising protection from screenshots or copies.
- [x] Security guidance tells the owner to use a dedicated Signal account on a separate phone, verify its number before publishing it in Settings, and handle unknown files/links in an isolated VM or with Dangerzone.
- [x] The named project artifacts `release/buddha-news-database.sql.gz`, `Buddha-News-Complete-Package.zip`, and `vite.config.ts.bak` are absent from the project; no removal was needed.
- [x] New article-view rows store `null` rather than an IP-derived identifier; they count page loads, not unique readers. Existing rows were not read, changed or cleared.
- [ ] The owner/developer reviews whether pre-existing article-view IP identifiers and contact/audit IP or User-Agent values should be retained or deleted, and sets retention policies; no database rows were inspected, migrated or modified during this work.
- [ ] Backups are kept encrypted and offline, outside the web project and deployment; no offline backup location was supplied for verification.
- [ ] Before public launch, the owner configures and verifies the dedicated Signal account/number, supplies a real contact email, replaces all demonstration articles, and provides the domain and Cloudflare-account access needed to configure Cloudflare WAF/DDoS protection.
- [ ] The owner publishes a verified private vulnerability-reporting channel. Until then, the general Contact form may receive only a brief non-sensitive request for that channel, not vulnerability details or exploit evidence.

## Verification evidence
- `pnpm check`: clean.
- `pnpm test`: 10 tests passed, including four session-expiry regressions.
- `pnpm build`: clean.
- Preview listener is bound to `0.0.0.0:3000`; root, `/api/health`, `/contact`, `/tip-line`, `/privacy` and `/manus-routes.json` return HTTP 200; the manifest is valid JSON with 20 routes.
- Production `/api/health`: 200.
- Production article: 200 with story-specific title; missing story: 404.
- Production headers include CSP, HSTS, nosniff, Referrer-Policy and Permissions-Policy.
- A same-origin newsletter request succeeds; a request with `Origin: https://evil.example` is rejected with 403.
- Admin dashboard/editor/settings/audit and public pages exercised in the browser.
- Test-only owner, media row, views and audit entries removed before packaging.
