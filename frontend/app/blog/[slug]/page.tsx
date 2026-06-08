import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import {
  getAllSlugs,
  getPostBySlug,
  strapiImageUrl,
  type BlockNode,
  type InlineNode,
} from "@/lib/strapi";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { XIcon, LinkedInIcon, LinkIcon } from "@/components/social-icons";
import type { Metadata } from "next";

export async function generateStaticParams() {
  let slugs: string[] = [];
  try {
    slugs = await getAllSlugs();
  } catch {
    return [];
  }
  return slugs.map((slug) => ({ slug }));
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.aboast.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const seo = post.seo;
  const title = seo?.metaTitle || post.title;
  const description = seo?.metaDescription || post.excerpt;
  const ogImage = seo?.ogImage
    ? strapiImageUrl(seo.ogImage.url)
    : post.coverImage
      ? strapiImageUrl(post.coverImage.url)
      : undefined;
  const url = `${BASE_URL}/blog/${slug}`;
  const canonical = seo?.canonicalURL ?? url;

  return {
    title: `${title} — Aboast Blog`,
    description,
    robots: seo?.noIndex ? "noindex" : "index, follow",
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url,
      siteName: "Aboast",
      images: ogImage ? [ogImage] : [],
      type: "article",
      publishedTime: post.publishedAt,
      authors: post.author ? [post.author] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function collectText(nodes: ReadonlyArray<{ text?: string; children?: ReadonlyArray<{ text?: string }> }>): string {
  return nodes
    .map((n) => n.text ?? (n.children ? n.children.map((c) => c.text ?? "").join(" ") : ""))
    .join(" ");
}

function readingTime(blocks: BlockNode[] | undefined) {
  if (!blocks) return "3 min read";
  const text = blocks.map((b) => ("children" in b ? collectText(b.children) : "")).join(" ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 220))} min read`;
}

function renderInline(node: InlineNode, key: number): React.ReactNode {
  if (node.type === "link") {
    return (
      <a key={key} href={node.url} className="text-primary underline underline-offset-2 hover:opacity-80">
        {node.children?.map((c, i) => <span key={i}>{c.text}</span>)}
      </a>
    );
  }
  let text: React.ReactNode = node.text;
  if (node.bold) text = <strong>{text}</strong>;
  if (node.italic) text = <em>{text}</em>;
  if (node.underline) text = <u>{text}</u>;
  if (node.strikethrough) text = <s>{text}</s>;
  return <span key={key}>{text}</span>;
}

function RichText({ blocks }: { blocks: BlockNode[] }) {
  return (
    <div className="prose-aboast">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "paragraph":
            return <p key={i}>{block.children.map(renderInline)}</p>;
          case "heading": {
            const Tag = `h${block.level}` as keyof React.JSX.IntrinsicElements;
            return <Tag key={i}>{block.children.map(renderInline)}</Tag>;
          }
          case "list": {
            const ListTag = block.format === "ordered" ? "ol" : "ul";
            return (
              <ListTag key={i} className={block.format === "ordered" ? "list-decimal" : "list-disc"}>
                {block.children.map((item, j) => (
                  <li key={j}>{item.children.map(renderInline)}</li>
                ))}
              </ListTag>
            );
          }
          case "quote":
            return <blockquote key={i}>{block.children.map(renderInline)}</blockquote>;
          case "code":
            return (
              <pre key={i}>
                <code>{block.children.map((c, j) => <span key={j}>{c.text}</span>)}</code>
              </pre>
            );
          case "image":
            return (
              <figure key={i}>
                <Image
                  src={strapiImageUrl(block.image.url)}
                  alt={block.image.alternativeText || ""}
                  width={1200}
                  height={675}
                  className="w-full object-cover"
                />
              </figure>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

const SAAS_URL = process.env.NEXT_PUBLIC_SAAS_URL ?? "https://app.aboast.com";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const initial = (post.author?.[0] ?? "A").toUpperCase();

  const ogImage = post.seo?.ogImage
    ? strapiImageUrl(post.seo.ogImage.url)
    : post.coverImage
      ? strapiImageUrl(post.coverImage.url)
      : undefined;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: ogImage ? [ogImage] : [],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: post.author
      ? { "@type": "Person", name: post.author }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "Aboast",
      logo: { "@type": "ImageObject", url: `${BASE_URL}/logo-color.svg` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/blog/${slug}`,
    },
  };

  const breadcrumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${BASE_URL}/blog/${slug}` },
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

      {/* Header */}
      <section className="w-full max-w-3xl mx-auto mt-16 px-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          Back to blog
        </Link>

        <div className="flex items-center gap-2.5 text-sm text-muted-foreground mb-5">
          <span>{formatDate(post.publishedAt)}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
          <span>{readingTime(post.content)}</span>
          {post.author && (
            <>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span>{post.author}</span>
            </>
          )}
        </div>

        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-foreground leading-[1.06] mb-6">
          {post.title}
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">{post.excerpt}</p>

        {post.author && (
          <div className="flex items-center gap-3.5 mt-8">
            <span className="w-11 h-11 rounded-full bg-primary-soft border border-primary/30 text-primary grid place-items-center font-semibold text-lg">
              {initial}
            </span>
            <div>
              <p className="text-[15px] font-medium text-foreground">{post.author}</p>
              <p className="text-sm text-muted-foreground">Writing about social proof, growth, and product</p>
            </div>
          </div>
        )}
      </section>

      {/* Cover */}
      {post.coverImage && (
        <div className="w-full max-w-4xl mx-auto px-6 mt-12">
          <div className="rounded-2xl overflow-hidden border border-border bg-white">
            <Image
              src={strapiImageUrl(post.coverImage.url)}
              alt={post.coverImage.alternativeText || post.title}
              width={1200}
              height={675}
              className="w-full object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Body */}
      <article className="w-full max-w-3xl mx-auto px-6 mt-12">
        {post.content && <RichText blocks={post.content} />}

        {/* In-article CTA */}
        <div className="mt-14 relative">
          <div className="absolute inset-0 bg-primary/[0.06] blur-[80px] rounded-full pointer-events-none" />
          <div className="relative bg-white border border-border rounded-2xl p-9 md:p-12 overflow-hidden shadow-[0_1px_2px_rgba(15,15,15,0.04),0_12px_32px_-18px_rgba(15,15,15,0.12)]">
            <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary mb-3">Try aboast</p>
            <h3 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 leading-[1.1] text-foreground">
              Collect testimonials in{" "}
              <span className="font-serif italic text-primary">five</span> minutes.
            </h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-md">
              Free forever plan, no credit card required. Get a branded collection link and start shipping social proof today.
            </p>
            <a
              href={`${SAAS_URL}/sign-up`}
              className="group inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-7 py-3.5 rounded-full text-base font-medium transition-all shadow-[0_4px_24px_-6px_rgba(255,89,94,0.45)] hover:shadow-[0_6px_28px_-4px_rgba(255,89,94,0.55)]"
            >
              Start free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
            </a>
          </div>
        </div>

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
            <a href="#" aria-label="X" className="w-9 h-9 rounded-full bg-white border border-border hover:border-neutral-300 grid place-items-center text-foreground transition-colors">
              <XIcon className="w-3.5 h-3.5" />
            </a>
            <a href="#" aria-label="LinkedIn" className="w-9 h-9 rounded-full bg-white border border-border hover:border-neutral-300 grid place-items-center text-foreground transition-colors">
              <LinkedInIcon className="w-4 h-4" />
            </a>
            <a href="#" aria-label="Copy link" className="w-9 h-9 rounded-full bg-white border border-border hover:border-neutral-300 grid place-items-center text-foreground transition-colors">
              <LinkIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
