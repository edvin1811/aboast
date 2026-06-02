import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";

/**
 * Centralized cache tag keys + invalidation helpers for the public read endpoints
 * (/widget, /api/forms/public, /wall, /api/walls/public).
 *
 * Read endpoints wrap their Prisma query in `unstable_cache([key], { tags: [tag], revalidate: N })`.
 * Dashboard mutation handlers call the matching `invalidateX(shareId)` helper after a write so
 * the next request bypasses the cache and surfaces fresh data within a couple seconds — the
 * 60s revalidate is just the worst-case TTL if revalidation never fires.
 */

export const cacheTags = {
  widget: (shareId: string) => `widget:${shareId}`,
  form: (shareId: string) => `form:${shareId}`,
  wall: (shareId: string) => `wall:${shareId}`,
} as const;

export function invalidateWidget(shareId: string) {
  revalidateTag(cacheTags.widget(shareId), "max");
}

export function invalidateForm(shareId: string) {
  revalidateTag(cacheTags.form(shareId), "max");
}

export function invalidateWall(shareId: string) {
  revalidateTag(cacheTags.wall(shareId), "max");
}

/**
 * When a testimonial is created/published/unpublished/edited, every widget that
 * references it and every wall in its workspace renders stale content. Look up
 * the affected entities and invalidate each.
 */
export async function invalidateTestimonial(testimonialId: string) {
  const links = await db.widgetTestimonial.findMany({
    where: { testimonialId },
    include: { widget: { select: { shareId: true, workspaceId: true } } },
  });

  const widgetShareIds = new Set<string>();
  const workspaceIds = new Set<string>();
  for (const link of links) {
    if (link.widget.shareId) widgetShareIds.add(link.widget.shareId);
    workspaceIds.add(link.widget.workspaceId);
  }

  // If the testimonial isn't yet attached to a widget (fresh from a form submission),
  // still resolve its workspace so wall caches get a fan-out invalidation.
  if (workspaceIds.size === 0) {
    const t = await db.testimonial.findUnique({
      where: { id: testimonialId },
      select: { workspaceId: true },
    });
    if (t) workspaceIds.add(t.workspaceId);
  }

  const walls = workspaceIds.size
    ? await db.wallOfLove.findMany({
        where: { workspaceId: { in: [...workspaceIds] } },
        select: { shareId: true },
      })
    : [];

  for (const shareId of widgetShareIds) {
    if (shareId) revalidateTag(cacheTags.widget(shareId), "max");
  }
  for (const wall of walls) {
    if (wall.shareId) revalidateTag(cacheTags.wall(wall.shareId), "max");
  }
}
