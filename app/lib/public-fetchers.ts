import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { cacheTags } from "@/lib/cache";

/**
 * Cached Prisma fetchers for the three public read surfaces.
 * Both the page (RSC) and the API route handlers import from here so they hit
 * the same `unstable_cache` entry — one entry per shareId, invalidated by tag.
 *
 * TTLs are the worst case if no mutation ever fires `revalidateTag()`. In
 * practice dashboard mutations invalidate explicitly (see `app/lib/cache.ts`).
 */

const WIDGET_TTL = 60;
const FORM_TTL = 300; // forms change rarely
const WALL_TTL = 60;

export const getCachedWidget = (shareId: string) =>
  unstable_cache(
    async () =>
      db.widget.findUnique({
        where: { shareId },
        include: {
          widgetTestimonials: {
            include: { testimonial: true },
            orderBy: { order: "asc" },
          },
        },
      }),
    ["widget-public", shareId],
    { tags: [cacheTags.widget(shareId)], revalidate: WIDGET_TTL }
  )();

export const getCachedForm = (shareId: string) =>
  unstable_cache(
    async () => {
      const form = await db.form.findUnique({ where: { shareId } });
      if (!form || !form.isActive) return null;
      const fields =
        typeof form.fields === "string" ? JSON.parse(form.fields) : form.fields;
      return {
        id: form.id,
        name: form.name,
        shareId: form.shareId,
        description: form.description,
        fields,
        thankYouMessage: form.thankYouMessage,
        isActive: form.isActive,
      };
    },
    ["form-public", shareId],
    { tags: [cacheTags.form(shareId)], revalidate: FORM_TTL }
  )();

export const getCachedWall = (shareId: string) =>
  unstable_cache(
    async () => {
      const wall = await db.wallOfLove.findUnique({
        where: { shareId },
        include: { workspace: { select: { id: true, name: true } } },
      });
      if (!wall || !wall.isActive) return null;

      const testimonials = await db.testimonial.findMany({
        where: { workspaceId: wall.workspaceId, isPublished: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          rating: true,
          authorName: true,
          authorTitle: true,
          authorCompany: true,
          authorImage: true,
          createdAt: true,
          tags: true,
        },
      });

      return {
        wall: {
          id: wall.id,
          name: wall.name,
          shareId: wall.shareId,
          title: wall.title,
          description: wall.description,
          theme: wall.theme,
          layout: wall.layout,
          showRating: wall.showRating,
          showDate: wall.showDate,
          showCompany: wall.showCompany,
          columns: wall.columns,
          workspace: wall.workspace,
        },
        testimonials,
      };
    },
    ["wall-public", shareId],
    { tags: [cacheTags.wall(shareId)], revalidate: WALL_TTL }
  )();

// Cache-Control header strings for API routes.
export const PUBLIC_CACHE_HEADERS = {
  widget: "public, s-maxage=60, stale-while-revalidate=86400",
  form: "public, s-maxage=300, stale-while-revalidate=86400",
  wall: "public, s-maxage=60, stale-while-revalidate=86400",
} as const;
