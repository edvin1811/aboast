const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export interface SeoData {
  metaTitle: string;
  metaDescription: string;
  canonicalURL?: string;
  noIndex?: boolean;
  ogImage?: { url: string } | null;
}

export interface BlogPost {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: BlockNode[];
  author: string;
  publishedAt: string;
  updatedAt: string;
  coverImage?: { url: string; alternativeText?: string } | null;
  seo?: SeoData | null;
}

export type BlockNode =
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'heading'; level: number; children: InlineNode[] }
  | { type: 'list'; format: 'ordered' | 'unordered'; children: { type: 'list-item'; children: InlineNode[] }[] }
  | { type: 'quote'; children: InlineNode[] }
  | { type: 'code'; children: InlineNode[] }
  | { type: 'image'; image: { url: string; alternativeText?: string }; children: InlineNode[] };

export interface InlineNode {
  type: 'text' | 'link';
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  url?: string;
  children?: InlineNode[];
}

async function fetchStrapi<T>(path: string): Promise<T> {
  const res = await fetch(`${STRAPI_URL}/api${path}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Strapi fetch failed: ${path} (${res.status})`);
  const json = await res.json();
  return json.data as T;
}

export async function getAllPosts(): Promise<BlogPost[]> {
  return fetchStrapi<BlogPost[]>('/blog-posts?populate=*&sort=publishedAt:desc');
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await fetchStrapi<BlogPost[]>(`/blog-posts?filters[slug][$eq]=${slug}&populate=*`);
  return posts[0] ?? null;
}

export async function getAllSlugs(): Promise<string[]> {
  const posts = await fetchStrapi<BlogPost[]>('/blog-posts?fields=slug');
  return posts.map((p) => p.slug);
}

export function strapiImageUrl(url: string): string {
  if (url.startsWith('http')) return url;
  return `${STRAPI_URL}${url}`;
}
