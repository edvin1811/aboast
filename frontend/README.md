This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Blog illustrations

The images in blog posts are drawn from JSON specs, so they stay on brand and can be re-rendered when the design changes.

- Each post's pictures are described in `content/illustrations/<post-slug>.json`. The types (quotes, email, steps, compare, checklist, tiles, timeline, fanout, bars) are in `lib/illustrations.ts`.
- `npm run illustrations` builds the site, starts it with the preview route on, saves a JPG for every spec that doesn't have one in `public/blog/img/<post-slug>/<name>.jpg`, stops the site, and checks every post.
- `npm run illustrations -- --check` only reports: posts without pictures, broken specs, missing JPGs, and images that aren't in their post.
- `npm run illustrations -- <post-slug>` renders one post again; add `--no-build` when only JSON changed. `--all` renders everything.
- A post shows a picture with `![What it shows](/blog/img/<post-slug>/<name>.jpg "Caption")`. The title in quotes becomes the caption.
- Run `npx playwright install chromium` once per computer first.

The preview route returns 404 unless `ILLUSTRATIONS=1` is set, so it never shows on the live site.

An AI agent can do the whole job (pull, write specs for new posts, render, check, push) by following `.claude/skills/blog-illustrations/SKILL.md` at the repo root. In Claude Code, type `/blog-illustrations`.
