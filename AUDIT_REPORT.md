# Buddha News — Audit and repair report

**Audited file:** `buddha_news_interactive_multilingual_preview(1).html` (35,705 bytes)
**Rebuilt application:** this repository
**Audit date:** 13 November 2026

The original file was a good visual concept, but it was a single-page preview rather than a news website. The rebuild keeps its strongest ideas — trilingual navigation, a lead story, a live desk, dark mode and a tip line — and replaces the parts that could not run safely or for the long term.

## 1. What was wrong with the original

### Content and product

| Finding | Why it matters | Replacement |
| --- | --- | --- |
| Eight hardcoded stories in a JavaScript object; no article pages | A reader could never open or share a story | MySQL articles + translations, `/article/:slug`, category pages, search |
| Every card headline linked to `#gridSection` | The main reading action did nothing | Real article routes and related reporting |
| Secure tip line advertised `+1 (555) 019-2831` | A fictional/reserved number presented as a confidential channel is dangerous | Tip form stored in the protected inbox; no invented number; Settings accepts a verified Signal number only when the owner supplies one |
| No contact, newsletter, tip, search or live-stream function | The site looked interactive but had no working actions | Validated contact/tip/newsletter forms, search, live URL setting, RSS |
| “Verified news” claim with no verification workflow | Trust claim unsupported by the product | Draft → published workflow, author byline, corrections/AI policy pages, audit trail |
| All stories shared one date and no bylines | No sense of freshness or accountability | Per-story publication timestamps, authors, read time, categories |
| No About, privacy, terms or editorial policy | No ownership, data or corrections information | Full policy pages |

### Security and operations

| Finding | Risk | Replacement |
| --- | --- | --- |
| No server, login, roles or admin | Anyone with the file could change anything; no safe publishing | Express + tRPC, Manus OAuth, server-side `adminProcedure`, protected `/admin` routes |
| No audit logging | No way to investigate a bad edit or intrusion | Append-only `audit_logs` with actor, action, entity, IP, user agent and metadata |
| No rate limits | Spam, brute force and AI cost abuse | Per-IP limits on login, contact, newsletter, tips and AI; API-wide ceiling |
| Meta CSP with `'unsafe-inline'` for scripts; no header-level protections | Weak XSS/clickjacking posture | Helmet headers, strict production CSP with a hash for the one theme bootstrap, HSTS, nosniff, frame-ancestors, Permissions-Policy |
| `innerHTML` card rendering | Stored-XSS path as soon as content becomes editable | React escaping for UI; DOMPurify + marked for article HTML |
| No input validation | Malformed or hostile form data | Zod validation on every tRPC input; length and enum limits |
| No upload checks | Malicious file upload | 5 MB cap, allowed MIME list, magic-byte check, random storage key |
| No backups or migrations | Data loss during updates | Checked-in Drizzle migrations, database backup procedure in the publishing guide |
| No 404 status | Search engines index empty pages | Real 404 status and a designed not-found page |
| **Insecure first-user admin bootstrap** (found during this rebuild) | The first public visitor could become owner | Removed; only `OWNER_OPEN_ID` or an explicit `ADMIN_EMAILS` account can be admin |

### Design and accessibility

| Finding | Problem | Replacement |
| --- | --- | --- |
| Fixed 156×105 text logo | Did not scale or read as a modern mark | Responsive lotus mark + Fraunces wordmark |
| Merriweather/Roboto/Noto Naskh only | Generic, heavy, no editorial hierarchy | Fraunces display, Manrope UI, Vazirmatn Arabic; variable font loading |
| Subcategory filter used `art.sub === s || art.cat === c` | Selecting “Human Rights” returned the whole Afghanistan category | Scoped subcategory keys and exact filtering |
| Language stored only in `sessionStorage` | New tab/session lost the reader’s language | Locale persisted in `localStorage`; `<html lang/dir>` updated; per-story translations |
| Theme toggle not persisted | Reload reverted to OS preference | Persisted theme with pre-paint bootstrap |
| Pulse/smooth-scroll ignored reduced motion | Motion-sensitive readers had no escape | `prefers-reduced-motion` support; globe falls back to a static scene |
| `aria-current="true"/"false"` | Invalid current-page token | Proper navigation semantics and labels |
| Inline SVG placeholders without accessible names | Screen readers got decorative text or nothing | Editorial images with alt text; decorative marks `aria-hidden` |
| No Open Graph, canonical, JSON-LD, sitemap, robots or RSS | Weak sharing and search visibility | Server-rendered metadata, NewsArticle JSON-LD from `PUBLIC_SITE_URL` or the request host, sitemap, robots, RSS |
| No 3D or meaningful motion | The “modern” request was only a pulse badge | Lazy Three.js globe, ticker, reveals, reading progress, reduced-motion fallback |

## 2. Critical production bugs caught during the rebuild

These are the kinds of defects that only appear after a real build/start cycle:

1. **The seed CLI killed the production server.** `server/seed.ts` contained an `import.meta.url === process.argv[1]` block. When bundled into `dist/index.js`, that condition became true, the server seeded and called `process.exit(0)`. Fixed by moving the CLI to `server/seed-cli.ts` and removing the guard from the imported module.
2. **Article SEO used `req.path`, which became `/` inside the Express wildcard middleware.** Every story served the homepage title. Fixed by parsing `req.originalUrl` in `server/seo.ts`. Verified in production: article title, canonical path, article OG type and 404 status are now correct.
3. **Insecure first-account admin bootstrap.** Removed. Owner promotion is explicit.
4. **Dashboard analytics failed under MySQL `ONLY_FULL_GROUP_BY`.** The grouped query was rewritten and most-read titles are attached in code.
5. **Article paragraph spacing was overridden by a later `p { margin: 0 }` rule.** Added `p + p` spacing; body is readable again.
6. **The first production build shipped Mermaid/Shiki language chunks** because a heavy markdown renderer was used for article bodies. Replaced with marked + DOMPurify; admin, charts and the globe are now lazy-loaded chunks.

## 3. Verification performed

- `pnpm check` — clean TypeScript compile.
- `pnpm build` — client and server production bundles succeed.
- `pnpm start` on a test port — `/api/health` returns 200; home and article pages return 200; missing story returns 404.
- Article HTML in production contains the story-specific `<title>`, `og:type=article`, description and canonical path when `PUBLIC_SITE_URL` is configured (or the request host fallback is used).
- Category metadata and 404 metadata verified.
- Security headers verified in production: CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, frame restrictions.
- Admin dashboard, story list, editor save, settings save, media upload path, audit log and public article page exercised in the browser.
- Trilingual home page (English LTR, Pashto RTL) and light/dark themes inspected.
- Demo-only owner account, test media row, test views and test audit entries removed before packaging.

## 4. Honest residual risks and limits

No website can be guaranteed “unhackable.” These are the remaining limits of this implementation:

- **Single-container rate limiter.** It is intentionally simple and resets on restart. For multiple instances or serious abuse, put the same keys in Redis or put Cloudflare in front of the site.
- **Manus OAuth dependency.** The easiest hosting path uses Manus sign-in. Self-hosting requires replacing the auth provider; the publishing guide explains this.
- **No email delivery service is included.** Newsletter subscribers are stored and exportable, but sending campaigns requires connecting an email provider.
- **No scheduled publishing or multi-role editorial workflow yet.** The editor supports draft/published/archived and admin access; scheduling and copy-editor roles would be the next feature.
- **Demo content and AI illustrations** are placeholders. Replace them and change the `.example` contact address before launch.
- **Custom domains require a paid Manus plan** when using Manus hosting. A free project can publish to a Manus URL; buying/connecting a domain is the paid path (or self-host).
- **AI output can be wrong.** Every AI action is draft-only; an editor must review names, numbers, quotes and translations.
