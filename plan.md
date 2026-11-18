# Buddha News — Rebuild Plan

## Product goal

Replace the 35 KB single-file `buddha_news_interactive_multilingual_preview` with a complete, long-lived trilingual news platform for Buddha Media Group (BMG). The public site must feel like a modern international newsroom, not a template: cinematic editorial layout, a real 3D world-news hero, motion with restraint, and an AI newsroom layer that helps readers understand stories and helps editors publish faster.

The owner must be able to edit every story, image, category and setting from a secure browser dashboard without touching code. All admin actions must be auditable. The public site must remain fast and readable in English, Pashto and Dari, including right-to-left layout.

## Architecture

- **Stack:** React 19 + Vite + Tailwind CSS 4 + wouter (client), Express + tRPC + Drizzle ORM + MySQL (server), Three.js (hero scene), Framer Motion (page and scroll motion), Streamdown (safe Markdown rendering).
- **Serving:** One Node container serves `/api/*` and the built SPA. Public metadata and JSON-LD are injected server-side into `index.html` for `/`, `/article/:slug`, `/category/:key` and `/search`; the React app hydrates normally. A `<noscript>` article body gives crawlers a readable fallback.
- **Auth:** Manus OAuth (platform default), HttpOnly `webdev_app_session` cookie, with a seven-day maximum signed-session and cookie lifetime. Tokens carry an issuance time and verification rejects sessions without one or older than seven days. Admin = `role='admin'` or an email listed in `ADMIN_EMAILS`. All admin tRPC procedures require `adminProcedure`.
- **AI:** Built-in Manus LLM through `invokeLLM` (no external API key). Public: "Ask Buddha AI" briefing assistant with rate limits and a strict newsroom system prompt; per-article 60-second AI brief cached in the database. Admin: headline/summary/SEO/tag generation and full translation drafting into Pashto/Dari.
- **Media:** Uploads go to Manus storage through the supplied `storagePut` helper (JPEG/PNG/WebP only, 5 MB cap, random key). Existing generated editorial images are referenced by `/manus-storage/async-images/...` URLs.
- **Database tables:** `users`, `articles`, `article_translations`, `article_views`, `audit_logs`, `media_assets`, `newsletter_subscribers`, `contact_messages`, `site_settings`. Taxonomy is code-owned in `shared/news.ts` so labels stay consistent across three languages and cannot drift.
- **Security:** Helmet headers, strict CSP in production (no `unsafe-eval`), Origin checks on mutations, tRPC Zod validation, parameterized Drizzle queries, in-memory fixed-window rate limits, upload MIME and size checks, and an admin audit trail. Contact submissions, new article-view rows and anonymous audit entries do not persist source IP or User-Agent; rate-limit keys remain transient in memory. Article-view counts are page loads, not unique readers. Existing article-view rows are not changed and may contain reversible IP-derived identifiers. Admin routes are `noindex`, and secrets stay in environment variables.
- **Accessibility:** WCAG 2.2 AA target — skip link, landmarks, visible focus, 44 px targets, keyboard-operable mega menu and dialogs, `aria-live` for async answers and filters, reduced-motion fallbacks for the 3D scene and marquee, correct `lang`/`dir` per locale, descriptive alt text on every editorial image.

## Project structure

```
client/
  index.html                 Google Fonts, base meta, favicon
  public/                    favicon, manifest, robots, route manifest
  src/
    App.tsx                  route table, providers, shell
    index.css                design tokens, typography, motion, utilities
    components/
      site/                  Header, Footer, Ticker, Hero, cards, AI assistant, search, newsletter
      three/GlobeScene.tsx   lightweight Three.js globe
      admin/                 AdminLayout, ArticleEditor, MarkdownEditor, MediaPicker, StatCard
      ui/                    existing shadcn primitives
    contexts/I18nContext.tsx locale, direction, UI dictionary
    lib/                     trpc client, formatting, markdown helpers, seo
    pages/                   Home, Article, Category, Search, About, Contact, Legal, TipLine, NotFound
    pages/admin/             Dashboard, Articles, ArticleEdit, Audit, Media, Messages, Settings
server/
  _core/                     starter platform glue (OAuth, LLM, storage, Vite)
  db.ts                      Drizzle connection + typed queries
  routers.ts                 public + admin tRPC routers
  audit.ts                   append-only audit log + request metadata
  rateLimit.ts               in-memory sliding-window limiter
  seed.ts                    idempotent demo newsroom seed (12 stories x 3 locales)
  seo.ts                     server-side metadata injection + sitemap/RSS
  index.ts                   Express entry, security middleware, SEO routes
shared/
  news.ts                    taxonomy, locales, UI types
drizzle/
  schema.ts                  all tables
```

## Design direction

**Design Movement:** Editorial futurism — the typographic confidence of a print broadsheet (The Guardian, Bloomberg Businessweek) fused with a cinematic, instrument-panel digital surface. No generic SaaS cards, no purple gradients.

**Core Principles:** (1) Headlines are the interface — oversized Fraunces serif type carries hierarchy. (2) One signature colour does the pointing: saffron. (3) Every surface has a job; ornament is earned by motion or information. (4) The grid is asymmetric and editorial, never a uniform card wall.

**Colour Philosophy:** Warm paper (`#F6F1E8`) and near-black ink (`#151A20`) make long reading feel physical; deep teal (`#0E5A57`) signals analysis and trust; saffron (`#E9A23B`) is the brand's single ownable accent, used for live signals, links and the 3D globe's orbital ring. Dark mode is "midnight pressroom" (`#0D1116`) with the same saffron, not an inverted afterthought.

**Layout Paradigm:** A 12-column editorial canvas with intentional imbalance: a 7/5 hero, a 2/1 lead-plus-rail section, a numbered "Most read" rail, and category bands that alternate image-left/image-right. Sticky navigation is a slim ink bar; content breathes with generous whitespace.

**Signature Elements:** (1) A slowly rotating wireframe globe with a saffron orbital ring and particle field in the hero. (2) A thin saffron "live" pulse and a breaking-news ticker. (3) Numbered, rule-separated lists that feel like a newspaper index.

**Interaction Philosophy:** Calm and legible first, delightful second. Hover lifts are small (2–4 px), links underline on hover, the AI assistant opens as a focused side sheet, and the search dialog is command-palette fast. Nothing auto-plays sound.

**Animation:** Framer Motion reveals with 24 px rise and 0.5 s ease-out; stagger 60 ms. Page transitions are a 180 ms fade. The globe rotates at 0.05 rad/s and responds to pointer parallax. Ticker is a 40 s linear marquee, paused on hover/focus. All motion collapses under `prefers-reduced-motion`.

**Typography System:** Display: **Fraunces** 600–700, optical size 72–120 for hero, 36–48 for section heads. UI/body: **Manrope** 400–700, 16–18 px, 1.65 line height. Persian/Dari: **Vazirmatn** 400–700 with 1.9 line height and RTL-aware spacing. Numerals and metadata use Manrope with tabular figures.

**Brand Essence:** A calm, independent trilingual newsroom for a region the world misreads — precise, humane, forward-looking. Personality: composed, inquisitive, principled.

**Brand Voice:** Direct, specific, never breathless. Example: "The summit ended without a joint statement. Here is what the delegations did agree on." / "One story. Three languages. No noise."

**Wordmark & Logo:** A geometric lotus mark drawn as four ascending petals around a saffron dot, paired with a tight "BUDDHA" wordmark in Fraunces small caps and "NEWS" in Manrope letterspaced. The mark also becomes the favicon and app icon.

**Signature Brand Colour:** Saffron Flame `#E9A23B`.

## Delivery package

1. Live Manus-hosted site with a published URL and custom-domain instructions.
2. Source archive with README, `.env.example`, Dockerfile, migrations and seed.
3. `AUDIT_REPORT.md` — every defect found in the original file and how the rebuild fixes it.
4. `OWNER_HANDBOOK.md` — editing, publishing, AI tools, backups, roles.
5. `SECURITY_GUIDE.md` — hardening checklist, incident response, logging, rate limits.
6. `DEPLOYMENT_GUIDE.md` — domain purchase (Namecheap/Cloudflare), DNS, SSL, publish steps, ongoing costs.
