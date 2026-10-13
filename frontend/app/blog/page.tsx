import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { formatPostDate, getAllPosts, readingTime, type BlogPost } from "@/lib/blog";
import { ogImage, pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Blog: Guides to Collecting and Using Customer Testimonials",
  description: "Practical guides on asking for testimonials, the questions to ask, where to show social proof, and how to turn happy customers into signups.",
  path: "/blog",
  tag: "Blog",
});

/** The post's own cover, or its generated /api/og card. */
function coverFor(post: BlogPost) {
  return post.cover ?? ogImage(post.title, "BLOG");
}

export default function BlogPage() {
  const posts = getAllPosts();

  const featured = posts[0];
  const rest = posts.slice(1);

  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Aboast Blog",
    url: `${SITE_URL}/blog`,
    publisher: { "@type": "Organization", name: "Aboast", url: SITE_URL },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${SITE_URL}/blog/${post.slug}`,
      datePublished: post.date,
      author: { "@type": "Person", name: post.author },
    })),
  };

  return (
    <div className="relative flex flex-col items-center pb-24 min-h-screen">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }}
      />
      <Nav />

      {/* Header */}
      <section className="w-full max-w-4xl mx-auto mt-16 px-6 flex flex-col items-center text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-5">The aboast blog</p>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-foreground leading-[1.05] mb-6">
          Make customers your{" "}
          <span className="font-serif italic text-primary">loudest</span> fans.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Guides on asking for testimonials, the questions that get specific answers, and putting social proof where it moves people to sign up.
        </p>
      </section>

      {/* Posts */}
      <section className="w-full max-w-6xl mx-auto mt-20 px-6">
        {posts.length === 0 ? (
          <div className="text-center py-24 bg-white border border-border rounded-2xl">
            <p className="text-2xl font-semibold tracking-tight text-foreground mb-2">No posts yet</p>
            <p className="text-muted-foreground">Come back soon — we&apos;re cooking.</p>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <Link
                href={`/blog/${featured.slug}`}
                className="group block mb-10 rounded-2xl bg-white border border-border overflow-hidden transition-all hover:border-neutral-300 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_12px_32px_-18px_rgba(15,15,15,0.12)]"
              >
                <div className="grid md:grid-cols-2">
                  {/* The cover keeps its 1200×630 shape; the red fill around it
                      matches the generated cards when the text column is taller. */}
                  <div className="relative flex items-center bg-gradient-to-br from-primary to-primary-hover overflow-hidden">
                    <div className="relative w-full aspect-[1200/630]">
                      <Image
                        src={coverFor(featured)}
                        alt={featured.title}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        priority
                        unoptimized={!featured.cover}
                      />
                    </div>
                    <span className="absolute top-5 left-5 text-xs font-medium px-3 py-1 rounded-full bg-white text-primary">
                      Latest
                    </span>
                  </div>
                  <div className="p-9 md:p-12 flex flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-2.5 text-sm text-muted-foreground mb-4">
                      <time dateTime={featured.date}>{formatPostDate(featured.date)}</time>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      <span>{readingTime(featured.body)}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      <span>{featured.author}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-[1.12] mb-4 group-hover:text-primary transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-6">{featured.excerpt}</p>
                    <span className="inline-flex items-center gap-1.5 text-base font-medium text-primary">
                      Read article
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group rounded-2xl bg-white border border-border overflow-hidden flex flex-col transition-all hover:border-neutral-300 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)]"
                  >
                    <div className="relative aspect-[1200/630] bg-primary-soft overflow-hidden">
                      <Image
                        src={coverFor(post)}
                        alt={post.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        unoptimized={!post.cover}
                      />
                    </div>
                    <div className="p-7 flex-1 flex flex-col">
                      <p className="text-sm text-muted-foreground mb-2.5">
                        <time dateTime={post.date}>{formatPostDate(post.date)}</time> · {readingTime(post.body)}
                      </p>
                      <h3 className="text-xl font-semibold tracking-tight text-foreground leading-snug mb-2.5 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-[15px] text-muted-foreground leading-relaxed line-clamp-3 mb-5">{post.excerpt}</p>
                      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        Read
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
