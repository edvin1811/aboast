import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { XIcon, LinkedInIcon } from "@/components/social-icons";
import { formatPostDate, getAllPosts, getPost, readingTime, relatedPosts, renderMarkdown, wordCount, type BlogPost } from "@/lib/blog";
import { ogImage, RSS } from "@/lib/seo";
import { SIGN_UP_URL, SITE_URL } from "@/lib/site";

// Posts are files in content/blog, so every one is known at build time; an
// unknown slug is a real 404 rather than an on-demand render.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

/** Site-relative, so it works on preview deployments and locally; metadata
 *  and JSON-LD make it absolute. */
function coverFor(post: BlogPost) {
  return post.cover ?? ogImage(post.title, "BLOG");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const image = coverFor(post);
  const url = `/blog/${slug}`;

  return {
    title: { absolute: `${title} | Aboast Blog` },
    description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: { canonical: url, types: RSS },
    openGraph: {
      title,
      description,
      url,
      siteName: "Aboast",
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const initial = (post.author[0] ?? "A").toUpperCase();
  const cover = coverFor(post);
  const url = `${SITE_URL}/blog/${slug}`;
  const related = relatedPosts(post);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: [`${SITE_URL}${cover}`],
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    wordCount: wordCount(post.body),
    keywords: post.tags?.join(", "),
    author: { "@type": "Person", name: post.author, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "Aboast",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-color.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const breadcrumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <div className="relative flex flex-col items-center pb-24 min-h-screen">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }}
      />
      <Nav />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="w-full max-w-4xl mx-auto mt-12 px-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          Back to blog
        </Link>
      </nav>

      {/* Cover — the generated /api/og banner unless the post sets its own */}
      <div className="w-full max-w-4xl mx-auto px-6">
        <div className="rounded-2xl overflow-hidden border border-border bg-white">
          <Image src={cover} alt={post.title} width={1200} height={630} className="w-full h-auto object-cover" priority unoptimized={!post.cover} />
        </div>
      </div>

      <article className="w-full">
        {/* Header */}
        <header className="w-full max-w-3xl mx-auto mt-12 px-6">
          <div className="flex flex-wrap items-center gap-2.5 text-sm text-muted-foreground mb-5">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span>{readingTime(post.body)}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span>{post.author}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-foreground leading-[1.06] mb-6">{post.title}</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">{post.excerpt}</p>

          <div className="flex items-start gap-3.5 mt-8 pt-6 border-t border-border">
            <span className="w-11 h-11 rounded-full bg-primary-soft border border-primary/30 text-primary grid place-items-center font-semibold text-lg shrink-0">
              {initial}
            </span>
            <div>
              <p className="text-[15px] font-medium text-foreground">{post.author}</p>
              <p className="text-sm text-muted-foreground">Founder of Aboast</p>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="w-full max-w-3xl mx-auto px-6 mt-12">
          <div className="prose-aboast" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />

          {/* In-article CTA */}
          <aside className="mt-14 relative">
            <div className="absolute inset-0 bg-primary/[0.06] blur-[80px] rounded-full pointer-events-none" />
            <div className="relative bg-white border border-border rounded-2xl p-9 md:p-12 overflow-hidden shadow-[0_1px_2px_rgba(15,15,15,0.04),0_12px_32px_-18px_rgba(15,15,15,0.12)]">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary mb-3">Try aboast</p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 leading-[1.1] text-foreground">
                Collect testimonials in{" "}
                <span className="font-serif italic text-primary">five</span> minutes.
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-md">
                Free forever plan, no credit card required. Get a collection link, import your Google and Trustpilot reviews, and embed them on your site.
              </p>
              <a
                href={SIGN_UP_URL}
                className="group inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-7 py-3.5 rounded-full text-base font-medium transition-all shadow-[0_4px_24px_-6px_rgba(255,89,94,0.45)] hover:shadow-[0_6px_28px_-4px_rgba(255,89,94,0.55)]"
              >
                Start free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
              </a>
            </div>
          </aside>

          <div className="mt-12 flex items-center justify-between flex-wrap gap-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
              All posts
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] mr-1">Share</span>
              <a
                href={`https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on X"
                className="w-9 h-9 rounded-full bg-white border border-border hover:border-neutral-300 grid place-items-center text-foreground transition-colors"
              >
                <XIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on LinkedIn"
                className="w-9 h-9 rounded-full bg-white border border-border hover:border-neutral-300 grid place-items-center text-foreground transition-colors"
              >
                <LinkedInIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </article>

      {/* Keep reading — internal links between posts */}
      {related.length > 0 && (
        <section className="w-full max-w-6xl mx-auto mt-24 px-6" aria-labelledby="keep-reading">
          <h2 id="keep-reading" className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-8">
            Keep reading
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group rounded-2xl bg-white border border-border p-7 flex flex-col transition-all hover:border-neutral-300 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)]"
              >
                <p className="text-sm text-muted-foreground mb-2.5">
                  <time dateTime={p.date}>{formatPostDate(p.date)}</time> · {readingTime(p.body)}
                </p>
                <h3 className="text-lg font-semibold tracking-tight text-foreground leading-snug mb-2.5 group-hover:text-primary transition-colors">
                  {p.title}
                </h3>
                <p className="text-[15px] text-muted-foreground leading-relaxed line-clamp-3 mb-5">{p.excerpt}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Read
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
