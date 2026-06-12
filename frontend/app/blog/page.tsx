import Link from "next/link";
import Image from "next/image";
import { getAllPosts, strapiImageUrl } from "@/lib/strapi";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Aboast",
  description: "Tips, guides, and insights on collecting and displaying testimonials.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function readingTime(text: string | undefined) {
  if (!text) return "3 min read";
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 220))} min read`;
}

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof getAllPosts>> = [];
  try {
    posts = await getAllPosts();
  } catch {
    posts = [];
  }

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="relative flex flex-col items-center pb-24 min-h-screen">
      <Nav />

      {/* Header */}
      <section className="w-full max-w-4xl mx-auto mt-16 px-6 flex flex-col items-center text-center">
       
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-foreground leading-[1.05] mb-6">
          Make customers your{" "}
          <span className="font-serif  text-primary">loudest fans.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Playbooks, teardowns, and quiet confidence-builders on collecting and shipping social proof.
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
                  <div className="relative h-72 md:h-full md:min-h-[340px] bg-primary-soft overflow-hidden">
                    {featured.coverImage ? (
                      <Image
                        src={strapiImageUrl(featured.coverImage.url)}
                        alt={featured.coverImage.alternativeText || featured.title}
                        fill
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center p-10">
                        <p className="text-3xl font-semibold tracking-tight text-primary text-center leading-tight line-clamp-4">
                          {featured.title}
                        </p>
                      </div>
                    )}
                    <span className="absolute top-5 left-5 text-xs font-medium px-3 py-1 rounded-full bg-primary text-white">
                      Featured
                    </span>
                  </div>
                  <div className="p-9 md:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground mb-4">
                      <span>{formatDate(featured.publishedAt)}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      <span>{readingTime(featured.excerpt)}</span>
                      {featured.author && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                          <span>{featured.author}</span>
                        </>
                      )}
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
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group rounded-2xl bg-white border border-border overflow-hidden flex flex-col transition-all hover:border-neutral-300 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)]"
                  >
                    <div className="relative h-48 bg-primary-soft overflow-hidden">
                      {post.coverImage ? (
                        <Image
                          src={strapiImageUrl(post.coverImage.url)}
                          alt={post.coverImage.alternativeText || post.title}
                          fill
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center p-6">
                          <p className="text-xl font-semibold tracking-tight text-primary text-center leading-tight line-clamp-3">
                            {post.title}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="p-7 flex-1 flex flex-col">
                      <p className="text-sm text-muted-foreground mb-2.5">
                        {formatDate(post.publishedAt)}
                        {post.author && <span> · {post.author}</span>}
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

      {/* Newsletter */}
      <section className="w-full max-w-4xl mx-auto mt-32 px-6 relative">
        <div className="absolute inset-0 bg-primary/[0.08] blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 bg-white border border-border rounded-2xl p-12 md:p-16 flex flex-col items-center text-center overflow-hidden shadow-[0_1px_2px_rgba(15,15,15,0.04),0_24px_48px_-24px_rgba(15,15,15,0.16)]">
          <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-[1.1] mb-4">
            Get the next post in your inbox
          </h2>
          <p className="text-muted-foreground text-lg mb-8">One short note per month. No spam, ever.</p>
          <form className="flex max-w-md w-full mx-auto gap-3">
            <input
              type="email"
              placeholder="you@company.com"
              className="flex-1 px-5 py-3 rounded-full border border-border bg-white text-foreground text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-full text-[15px] font-medium transition-all shadow-[0_4px_24px_-6px_rgba(255,89,94,0.45)] hover:shadow-[0_6px_28px_-4px_rgba(255,89,94,0.55)]"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
