# Deploy www.aboast.com

The site is the Vercel project that builds `frontend/` from this repo. There is no CMS or
database to host for it any more.

1. Vercel → the aboast.com project → **Settings**: Root Directory stays **`frontend`**.
2. Environment variables (names in `frontend/.env.example`):
   - `NEXT_PUBLIC_APP_URL=https://www.aboast.com`
   - `NEXT_PUBLIC_SAAS_URL=https://app.aboast.com`
   - `ANTHROPIC_API_KEY` — writes blog posts on request.
   - `CRON_SECRET` — any long random string (`openssl rand -base64 32`). The blog endpoint
     refuses requests without it.
   - `GITHUB_TOKEN` — a fine-grained token (GitHub → Settings → Developer settings →
     Fine-grained tokens) for the repository `edvin1811/aboast` with
     **Contents: Read and write**. The blog writer commits new posts with it.
   - `NEXT_PUBLIC_STRAPI_URL` and `STRAPI_TOKEN` are no longer used; delete them.
3. Merge to `main`. Every push to `main` redeploys, including posts the blog writer commits.

The old daily cron (`vercel.json`) is gone. Vercel → Project → **Cron Jobs** should be empty
after the deploy.

## Retire Strapi
Nothing reads the Strapi CMS any more. Stop its service and Postgres database on
Railway/Supabase and the R2 bucket it uploaded to, then delete `website/` from the repo.

## Checking the blog writer
- Vercel → Project → **Logs** show `[cron/publish]` lines.
- Dry run (writes nothing):
  `curl -H "Authorization: Bearer $CRON_SECRET" "https://www.aboast.com/api/cron/publish?dry=1"`

## Search Console
Submit `https://www.aboast.com/sitemap.xml` once. Every post URL from the Strapi blog is
unchanged, so rankings carry over.
