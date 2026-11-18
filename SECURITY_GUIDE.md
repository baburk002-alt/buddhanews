# Buddha News — security guide

This guide explains what protects the newsroom, what is logged, and what the owner should do when something looks wrong. It is written for a non-developer owner and for a developer who takes over the code.

## 1. Security model

| Layer | Control |
| --- | --- |
| Identity | Manus OAuth; no passwords stored in this application |
| Authorization | Server-side `adminProcedure` on every newsroom query and mutation |
| Owner promotion | `OWNER_OPEN_ID` (Manus project owner) or an explicit `ADMIN_EMAILS` allow-list |
| Session | Signed JWT in an HttpOnly cookie; `SameSite=None; Secure` for the embedded HTTPS preview; maximum seven-day lifetime |
| Transport | HTTPS at the platform edge; HSTS enabled in production |
| Input | Zod schemas, enum/length limits, server-side validation on every procedure |
| Output | React escaping; article Markdown sanitized with DOMPurify before `dangerouslySetInnerHTML` |
| Abuse | In-memory per-IP fixed-window limits on login, contact, tip, newsletter and AI; API-wide ceiling |
| Uploads | 5 MB cap, MIME allow-list, magic-byte validation, randomized storage key |
| Headers | Helmet CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, frame restrictions |
| CSRF | State-changing API requests must come from the exact request host; add a specific extra origin only through `ALLOWED_ORIGINS` |
| Audit | Append-only `audit_logs` table; privileged events may include IP/User-Agent, but anonymous source submissions store neither |
| Data | MySQL with checked-in migrations; no secrets in the repository |

## 2. Newsroom access

- The Manus account that owns the project becomes administrator automatically when it signs in.
- Additional administrators must be explicitly allow-listed:

```env
ADMIN_EMAILS=owner@example.com,editor@example.com
```

  Redeploy after changing the variable. The account is promoted on its next sign-in. Removing an email from the list does **not** demote an existing administrator; demote manually in the database if someone leaves.
- There is no “first visitor becomes admin” behavior. This was deliberately removed.
- Sign out from the newsroom sidebar when using a shared computer.
- Treat a Manus account like a key to the building: enable the strongest sign-in protection Manus offers for that account.

## 3. What the audit log records

The protected **Security log** page (`/admin/audit`) shows the latest events. Events include:

- `auth.login` / admin sign-in and authorization failures where applicable
- `article.create`, `article.update`, `article.delete`
- `media.upload`, `media.delete`
- `settings.update`
- `message.read`, `message.delete`
- `subscriber.export`
- `ai.assist` (editor AI actions)
- anonymous tip/contact/newsletter submissions where the procedure records them, without source IP or User-Agent

Privileged-action rows contain the authenticated actor (never a browser-supplied identity), action, entity, request IP/User-Agent and optional metadata. Anonymous source/contact records omit IP and User-Agent; contact messages store the message in the newsroom inbox but do not persist those network identifiers. Audit writes are best-effort: a logging failure is printed to the server console but does not block a legitimate editorial action. That trade-off keeps publishing available during a database hiccup; monitor the server logs if the audit page is unexpectedly empty.

**Review rhythm:** check the security log weekly, and immediately after adding an editor, changing settings, or seeing unusual traffic. Export or screenshot important rows before rotating a compromised account.

## 4. Rate limits and abuse response

The current limits are intentionally conservative for a small newsroom:

| Surface | Limit |
| --- | --- |
| Contact form | 4 per hour per IP |
| Tip line | 4 per hour per IP |
| Newsletter | 6 per hour per IP |
| Public AI assistant | 20 per hour per IP |
| Public article brief | 12 per hour per IP |
| Editor AI actions | 40 per hour per admin |
| API-wide | 300 requests per minute per IP |

Sign-in itself is handled by Manus OAuth; the application does not store passwords, so there is no local password brute-force surface. The API-wide limit still applies to callback traffic.

If the site is under a sustained attack, put Cloudflare (or the platform's equivalent) in front of it, enable a managed WAF/rate-limit rule, and block the offending ASN/country only after checking that you are not blocking legitimate readers. Do not publish a “keep-alive” pinger to fight an attack; it increases cost without improving security.

The limiter is in-memory and per container; a CDN does not make those buckets shared between app instances. The source IP is used transiently as a rate-limit key, but it is not persisted with contact messages or anonymous source audit entries. For multiple instances, move the same keys to Redis or let the CDN enforce the edge limit.

## 5. Content and upload safety

- Article Markdown is sanitized with DOMPurify. Scripts, event handlers and `javascript:` URLs are removed even if an editor pastes hostile HTML.
- Cover images must be JPEG, PNG, WebP, GIF or AVIF and pass a magic-byte check. SVG is not accepted for uploads (it can carry scripts); the static brand favicon is served from the trusted repository.
- Never open files or links sent by strangers on your primary computer. Use an isolated virtual machine such as Tails OS or Qubes OS, or sanitize documents with Dangerzone before inspection; verify unexpected links through a separate trusted channel.
- The website Contact form is for non-sensitive messages only; it is stored in the newsroom inbox and is not end-to-end encrypted. High-risk sources must not enter secrets or confidential documents into website forms. The newsroom owner should set up a dedicated Signal account on a separate phone, verify its number through a second channel, and publish it in Settings only after verification. Tell sources to enable disappearing messages; this reduces local retention but cannot prevent screenshots or copies. Consider Tor Browser for visiting this page, without promising anonymity.

## 6. Secrets and environment

- Keep `.env` out of Git and out of screenshots. `.dockerignore` excludes it from images.
- `MANUS_JWT_SECRET`, `DATABASE_URL`, `MANUS_API_KEY` and OAuth values are server-only. Never prefix them with `VITE_`.
- Only browser-safe values belong in client code. The client receives no database or AI credentials.
- Rotate the JWT secret if a session token may have leaked; this invalidates all existing sessions.
- Rotate the Manus API key / database password through the platform or database provider if either is exposed.
- Do not paste production secrets into a support chat, an AI prompt or a public issue tracker.

## 7. Headers and CSP

The production server sets a strict Content-Security-Policy:

- Scripts only from the site origin, plus a SHA-256 hash for the tiny inline theme bootstrap.
- No inline event handlers (`script-src-attr 'none'`).
- Frames only from the site and YouTube/YouTube-nocookie for the live desk.
- Objects disabled; base URI restricted; form actions restricted to the site.
- `frame-ancestors 'self'`; the Manus preview is intentionally allowed by the platform's embedding setup. If you self-host outside an iframe and do not need embedding, change this to `'none'`.
- `style-src` allows inline styles because React and Tailwind emit them. This is a pragmatic trade-off, not an invitation to paste untrusted style attributes.

The inline `NewsArticle` JSON-LD block is generated from `PUBLIC_SITE_URL` when set, otherwise from the request host. Some browsers will report it as blocked by the script hash; search engines read it from the HTML source. If you want a perfectly clean console, render JSON-LD with a nonce or move it to a static endpoint.

## 8. Backups and recovery

- Before every schema change: `mysqldump` the database (see the publishing guide).
- Keep at least 7 daily and 4 weekly copies encrypted and offline, outside both the web project and deployment package. Never include database dumps, full package archives, or `vite.config.ts.bak` in the project or deployment.
- Test a restore on a staging database once a quarter. An untested backup is a hope, not a backup.
- The application container is ephemeral. Uploaded media lives in managed object storage; the database is the durable record. Do not rely on a local `uploads/` folder in production.
- If the site is compromised: take it private or put it behind maintenance mode, preserve logs and database snapshots, rotate secrets, review the audit log, patch the entry point, then restore from a known-good backup. Do not delete evidence before capturing it.

## 9. Incident checklist

1. **Confirm** — is this a real incident (unexpected admin, defaced story, spike, leaked key) or a false alarm?
2. **Contain** — remove the malicious account/session, rotate the JWT secret, disable the affected integration.
3. **Preserve** — export audit rows, server logs and a database snapshot.
4. **Eradicate** — fix the vulnerable code/configuration; do not just delete the visible symptom.
5. **Recover** — restore service from a clean build and verified backup.
6. **Learn** — write a short post-incident note: what happened, what was exposed, what changed.
7. **Notify** — if personal data was exposed, follow the applicable privacy law and the commitments on the Privacy page.

## 10. Hardening roadmap

Cloudflare is not configured in this project. Before public launch, the owner must connect the final domain through an authorized Cloudflare account, enable WAF and DDoS protections, and verify the DNS and rules. The domain and account access have not been supplied, so this guide does not claim that edge protection is active.

The following are additional hardening investments:

- Review Cloudflare's managed OWASP rules, edge rate limits and origin-bypass paths after the domain is connected.
- Redis-backed rate limits and login throttling for multi-instance hosting.
- Email or push alerts for new admin sign-ins, failed logins and audit anomalies.
- 2FA at the identity provider, and a quarterly access review.
- Automated dependency updates (`pnpm audit`, Dependabot/Renovate) and a monthly patch window.
- Nonce-based CSP for JSON-LD and any future inline script.
- A staging database and a one-click restore drill.
- A verified Signal/secure-drop channel with a published key fingerprint, if the newsroom needs one.

## 11. Reporting a vulnerability

No dedicated private security-disclosure channel is configured. Do not send vulnerability details, exploit material or sensitive proof through the general Contact form. Until the owner publishes a verified secure channel, send only a brief, non-sensitive request asking for that channel, or wait. Do not invent or publish a security address before the owner supplies one.
