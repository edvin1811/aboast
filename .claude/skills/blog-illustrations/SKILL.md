---
name: blog-illustrations
description: Pull the latest edvin1811/aboast from GitHub, add on-brand illustrations to blog posts that don't have any yet (usually new posts from the blog writer), render them to JPG, put them in the posts, check everything, and push to main. Use when asked to illustrate new blog posts, update the blog images, or to "pull, run everything and push" for the aboast.com website.
---

# Blog illustrations: pull, illustrate, check, push

Every post in `frontend/content/blog/` has one or two pictures. The blog writer (`/api/cron/publish`) adds new posts to `main` without pictures, so run this after it has written something.

A picture is a small JSON description in `frontend/content/illustrations/<post-slug>.json`. `npm run illustrations` draws it with the website's own components and saves a JPG in `frontend/public/blog/img/<post-slug>/<name>.jpg`. The post shows it with a normal Markdown image line.

Run every command below from `frontend/` unless it says otherwise. Work through the steps in order and don't skip the checks.

## 1. Get the latest code

```bash
git status --short
```

If anything is listed, stop and ask the user what to do with those changes. Don't stash, commit or discard them yourself.

```bash
git checkout main
git pull --ff-only origin main
npm install
```

If the pull is refused because the histories differ, stop and tell the user. Never rebase, reset or force anything at this step.

The first time on a computer, also run `npx playwright install chromium` once. It downloads the browser that takes the pictures.

## 2. Find the work

```bash
npm run illustrations -- --check
```

It lists posts without an illustration and any problems: a broken spec, a missing JPG, or an image that isn't in its post. If it says "All posts have illustrations and nothing is broken", tell the user there's nothing to do and stop.

## 3. Write the specs

For each post without an illustration:

1. Read the whole post.
2. Pick one or two sections where a picture says more than the text. Good candidates: numbered steps, a comparison table, example testimonials, an example request email, a checklist, a timeline, or "one thing becomes many". Skip the intro and wrap-up. Short posts get one picture; long posts get two at most.
3. Write `content/illustrations/<post-slug>.json`. It holds a list, even for one picture. Copy the shape of an existing file of the same type. The types are defined in `lib/illustrations.ts`.

Every spec has:
- `name`: lowercase words joined by hyphens, unique in the file, such as `sample-week`. It becomes the file name.
- `type`: one of the types below.
- `label`: 2 to 4 words shown in the corner, such as `A bakery's week`. 30 characters at most.

| Type | Use it for | Fields |
|---|---|---|
| `tiles` | 3 to 6 ideas, kinds of things, or mistakes | `tiles: [{ title, body, icon }]` |
| `steps` | A process in order (5 or more steps become a vertical list) | `steps: [{ title, body, icon }]` |
| `quotes` | Example testimonials, as they'd look in a widget | `quotes: [{ text, name, role, stars, source }]` |
| `email` | An example request email, written out | `from`, `subject`, `body: [paragraphs]`, `button` |
| `timeline` | Phases of a plan | `phases: [{ when, title, body, peak }]`. Set `peak: true` on exactly one |
| `compare` | A table with 2 or 3 columns | `columns: [{ name, note, highlight }]`, `rows: [{ label, values }]`, `footnote` |
| `checklist` | A list to tick off before something | `title`, `items: [...]` |
| `fanout` | One thing turned into several | `source: { title, body, icon }`, `outputs: [{ label, icon }]` |
| `bars` | Real numbers from the post | `bars: [{ label, value, icon }]`, `unit`, `log` |

Details for each type:
- **quotes**: use 1 to 3 cards. Every card is drawn with an "Example" badge, because these are made-up quotes and must never look like real Aboast customers. `name` is a made-up name that fits the post's example business; `role` is optional ("Owner, Fernwood Café"); `stars` defaults to 5; `source` adds "via Google" and so on under the name. Never use a real company or person.
- **email**: `from` is a sender like `Edvin, founder`; keep `body` to 2 to 4 short paragraphs; `button` is the collection link's label.
- **compare**: in `values`, `"yes"` draws a tick and `"no"` draws a dash; anything else is shown as text. A column named `Aboast` gets the logo, and `highlight: true` tints it. If it shows prices or features of other companies, add `footnote` with where the facts came from and when they were checked, copied from the post.
- **bars**: use `log: true` when one value is much bigger than the rest.
- **Sources** (for `quotes`): `google`, `trustpilot`, `yelp`, `tripadvisor`, `form`, `email`. Nothing else is drawn.
- **Icons**: bag, bell, calendar, call, camera, chart, check, clock, code, comment, eye, form, gift, globe, grid, heart, idea, image, inbox, layers, link, mail, megaphone, mic, phone, quote, repeat, scheduled, search, send, shield, sparkles, star, store, tag, target, thumbs, trend, users, video, write, zap.

Text has to fit. These are the longest texts that already fit; stay under them:

| Field | Max characters |
|---|---|
| tiles: title / body | 28 / 90 |
| steps: title / body | 26 / 60 |
| quotes: text | 1 card 130, 2 cards 120, 3 cards 100; name 20; role 30 |
| email: subject / each paragraph | 45 / 110, with 2 to 4 paragraphs |
| timeline: when / title / body | 16 / 22 / 50. With 6 phases, keep titles under 14, with no word over 11 letters |
| compare: row label / value / column note | 27 / 33 / 34 |
| checklist: title / item | 40 / 48, with 5 to 10 items |
| fanout: source title / source body / output | 22 / 60 / 42, with 3 to 5 outputs |

Content rules (the same rules as the blog):
- Use only what the post says. Don't invent numbers, percentages or results. Example testimonials in `quotes` and example emails in `email` are fine, because they're drawn as examples.
- No percentages at all; the check rejects them.
- Plain, short words. Sentence case, not Title Case.
- Never put Aboast itself in an example quote: the quotes are about the reader's business, not about us.

## 4. Render

```bash
npm run illustrations
```

This builds the site, starts it with the preview page switched on, saves a JPG for every spec that doesn't have one yet, and stops the site again. It takes a few minutes, mostly the build.

Then open every new JPG and look at it. Check that:
- no text is cut off, runs past a card's edge, or breaks in the middle of a word
- nothing overlaps
- the picture isn't mostly empty space

To fix one, shorten or change the text in the JSON, then re-render just that post:

```bash
npm run illustrations -- <post-slug> --no-build
```

`--no-build` is safe when you've only changed JSON files. Don't edit the templates in `components/illustrations/` to make something fit; change the content instead. If a picture really can't work, use a different type or tell the user.

Don't run `--all` unless the user asks for it. It re-renders every image in the blog.

## 5. Put the pictures in the posts

For each picture, add one line to the post, in the section it illustrates:

```markdown
![One sentence describing what the picture shows.](/blog/img/<post-slug>/<name>.jpg "Short caption.")
```

- Put it after the section's first paragraph. If the section starts with a list, a table or a quote, put it directly under the `## ` heading instead.
- Leave a blank line before and after it.
- The alt text (in the square brackets) describes the picture for people who can't see it. The caption (in quotes) is a few words, ends with a full stop, and has no double quotes in it.
- Don't change anything else in the post.

## 6. Check

```bash
npm run illustrations -- --check
npx tsc --noEmit
```

The check has to say "All posts have illustrations and nothing is broken". Fix anything it lists and run it again.

To see a post the way readers will, run `npm run start` and open `http://localhost:3000/blog/<post-slug>`. Stop the server afterwards.

## 7. Commit and push

Stage only what this job changed:

```bash
git add content/illustrations public/blog/img content/blog
git status --short
```

If `git status` lists other changed files, leave them out of the commit and mention them to the user.

```bash
git commit -m "Add illustrations to new blog posts" -m "<one line per post: slug and what the pictures show>"
git push origin main
```

If the push is refused because `main` moved (the blog writer may have just added a post), run `git pull --rebase origin main`. Then go back to step 2 to illustrate the new post too, and push again. Never force-push.

Pushing to `main` deploys www.aboast.com through Vercel.

## 8. Tell the user

List each post you illustrated, with the pictures you made and a one-line description of each. Mention anything you skipped and why.
