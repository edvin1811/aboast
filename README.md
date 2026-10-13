# Aboast

**Aboast** (www.aboast.com) collects customer testimonials and shows them on your website.

```
aboast/
├── app/        the Aboast app (app.aboast.com)
├── frontend/   Next.js on Vercel (www.aboast.com): homepage and blog
└── website/    the retired Strapi CMS; nothing uses it any more (see DEPLOY.md)
```

## Site structure (frontend/)
- `/` homepage
- `/blog` + `/blog/[slug]` — Markdown files in `frontend/content/blog/`
- `/blog/rss.xml`, `/sitemap.xml`, `/robots.txt` — generated from the same files
- `/api/og` — social images; `/api/cron/publish` — writes a blog post on demand

Design rules: `frontend/DESIGN.md`. Plan limits, import sources and widget styles the site
states come from `frontend/lib/site.ts`, which mirrors `app/lib/plans.ts`.

## The blog
Posts are Markdown files with front matter in `frontend/content/blog/<slug>.md`. Every
page is static; nothing is fetched at request time.

To publish a post, add its Markdown file and push to `main`; the site redeploys and the post
is live a couple of minutes later. To fix a typo or delete a post, edit or delete its file.
Front matter: `title`, `slug`, `excerpt`, `date`, `author`, and optionally `updated`,
`seoTitle`, `seoDescription`, `cover`, `topic` and `tags`.

There's no schedule. `/api/cron/publish` can still write one for you on request: it asks
Claude for a post on the next unused topic in `frontend/lib/blog-writer.ts`, checks it, and
commits it to `main` through the GitHub API (`?topic=...` picks the subject).

Try it without publishing:
```bash
curl -H "Authorization: Bearer $CRON_SECRET" "https://www.aboast.com/api/cron/publish?dry=1"
```

New posts arrive without pictures. To illustrate them, follow
`.claude/skills/blog-illustrations/SKILL.md` (in Claude Code: `/blog-illustrations`).

## Local setup
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev   # http://localhost:3000
```

## Deploy
See `DEPLOY.md`.

## ⚠️ Secrets
Never commit real values. `.env` files are gitignored; only `frontend/.env.example` (names
only) is tracked. Rotate any key that has ever been shared.
