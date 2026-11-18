# Buddha News — owner and editor handbook

This is the day-to-day guide. It assumes the site is published and you are signed in at `/admin`.

## 1. First sign-in and access

1. Open `https://your-site/admin`.
2. Choose **Continue with Manus** and use the account that owns the project.
3. The project owner is promoted to administrator automatically. If you are using a different account, add its exact email to `ADMIN_EMAILS` in the hosting environment and redeploy; sign in again.
4. You should see **Newsroom overview** with story counts, views, subscribers, inbox and the latest security events.

If the dashboard says “not authorized,” the account is not an administrator. Do not create a public “first user becomes admin” workaround; fix the allow-list or sign in with the owner account.

## 2. The dashboard

The dashboard gives you a quick pulse:

- **Published / drafts / archived** story counts.
- **Views** across published stories.
- **Subscribers** and unread messages.
- **Most read** stories.
- **Security events** — a short preview of the audit log.
- Quick actions to write a story, upload media, open the inbox or review security.

## 3. Writing and publishing a story

Open **Stories → New story**.

1. **Language tabs.** Write the English version first. Then switch to **پښتو** and **دری**.
2. **Headline.** Be specific. Avoid vague or clickbait phrasing.
3. **Summary.** Two sentences that tell the reader what changed and why it matters.
4. **Body.** Markdown is supported:
   - `## Heading` for a section.
   - `> Quote` for a pull quote.
   - `- item` for a bullet list.
   - `**bold**` and `[link](https://example.com)`.
   - Leave a blank line between paragraphs.
5. **AI tools.** In the editor you can ask Buddha AI for five headlines, a summary, SEO fields, tags, or a first translation. AI output is a draft. Check every name, number, date, quote and local idiom before using it. The translation button is especially useful for a first pass, not for publication without review.
6. **Metadata.**
   - Category and subcategory. Subcategories are scoped to their parent category, so “Women” under Afghanistan does not mix with “Women” elsewhere.
   - Author byline (defaults to “BMG Desk” if left blank).
   - Read time in minutes.
   - Cover image and alt text. Alt text should describe what a reader sees, not repeat the headline.
   - Tags, featured and breaking flags.
7. **Status.**
   - `draft` — private working copy, not on the public site.
   - `published` — visible on the public site.
   - `archived` — hidden from normal listings; keep it for the record.
8. **Save.** Use **Save story** at the bottom of the editor. Publishing is a separate status choice; saving a draft does not put it live.

There is no scheduled-publishing control in this version. Publish manually at the intended time.

## 4. Media library

Open **Media**.

- Upload JPEG, PNG, WebP, GIF or AVIF up to 5 MB.
- The file is checked by extension, MIME type and magic bytes.
- Give every image useful alt text. Purely decorative images should not be uploaded as story covers.
- Copy the image URL into a story, or choose **Use image** from the editor’s media picker.
- Delete unused assets to keep the library tidy. Deleting the database record does not necessarily delete the stored object; treat the storage provider as the source of truth for binary cleanup.

**Editorial images:** the demonstration stories use AI-generated illustrations. Replace them with your own photography or clearly label generated imagery in the caption, consistent with the Editorial Policy page.

## 5. Inbox and tip line

Open **Inbox** to read contact messages and confidential tips.

- Messages show the sender, subject, time and body.
- Mark a message read after you have handled it.
- Do not forward a tip to a third party without the source’s consent.
- The tip form is a secure **submission inbox**, not end-to-end encrypted chat. For high-risk sources, use a verified Signal account and a published key fingerprint. Add that number in **Settings** only when it is real.

## 6. Subscribers

Open **Subscribers** to see newsletter sign-ups and export a CSV.

- The site stores the email and locale. It does **not** send campaigns by itself.
- Connect an email provider (Mailchimp, Buttondown, Resend, etc.) to send the newsletter.
- Include an unsubscribe link in every campaign, even though the site form itself only collects opt-ins.
- Export only when needed and store the CSV securely.

## 7. Settings

Open **Settings** to change:

- Site name and tagline.
- Contact email (replace the `.example` placeholder).
- Live stream URL (YouTube or another embeddable URL). Leave blank to show the “live desk” without a broken player.
- Verified Signal number for the tip page. Leave blank if you do not have one.
- Announcement banner text.
- Default social-sharing image.

Saving settings writes an audit entry.

## 8. Security log

Open **Security log** to review privileged actions.

- Filter or scan for unexpected sign-ins, story deletions, settings changes, exports or AI actions.
- Review weekly and after any access change.
- If you see an action you did not authorize: sign out all sessions by rotating the JWT secret, remove the account from `ADMIN_EMAILS`, preserve the log, and follow the incident checklist in the Security Guide.

## 9. AI desk

The public **Ask Buddha AI** drawer answers from recent newsroom headlines and the story the reader is viewing. It is instructed not to invent facts and to say when the record is thin. It is still a language model:

- Do not treat an AI answer as a correction or a source.
- The 60-second brief is generated from the article only and labelled as AI.
- AI actions are rate-limited and audited.
- The assistant is not a substitute for a human editor, lawyer, doctor or financial adviser.

## 10. Routine maintenance

### Daily

- Check the inbox and tip line.
- Review the homepage for broken images or stale lead stories.
- Publish or update the lead story.

### Weekly

- Review the security log.
- Check the most-read list and category pages.
- Clear drafts that are no longer needed.
- Check that the live stream URL still works.

### Monthly

- Export a database backup and confirm it is readable.
- Review administrator access.
- Update dependencies in a staging copy, run `pnpm check` and `pnpm build`, then deploy.
- Check Google Search Console for coverage and mobile usability issues.
- Review AI outputs and correct any recurring translation problems.

### Quarterly

- Restore a backup into a staging database.
- Rotate non-essential API keys.
- Review privacy/editorial policies against actual practice.
- Ask a second person to review access and publishing permissions.

## 11. Content standards

- Attribute claims to a named source or explain why anonymity was granted.
- Do not publish a photo of a real person as an AI-generated illustration.
- Correct errors openly; do not silently rewrite a published story. Add a correction note and update the timestamp.
- Keep headlines and summaries consistent with the body.
- Respect source safety: remove locations, names and identifying details when publication could endanger someone.
- Do not use the AI assistant to generate quotes or sources.

## 12. When something breaks

| Symptom | First check |
| --- | --- |
| Site returns 500 | Hosting logs; database connection; recent deploy |
| Images missing | Storage URL; whether the asset still exists in managed storage |
| Login loops | Manus OAuth callback URL; `PUBLIC_SITE_URL`; third-party cookie blocking |
| Article shows homepage title in search | `PUBLIC_SITE_URL` is set; rebuild and redeploy |
| AI returns an error | Manus API key/service availability; rate limit message |
| Contact/tip form fails | Rate limit; database; spam filter |
| “Not authorized” | `ADMIN_EMAILS` / owner account; role in database |

For a production incident, use the Security Guide’s containment and recovery checklist before making broad changes.
