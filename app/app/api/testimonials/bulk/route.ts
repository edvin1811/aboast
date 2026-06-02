import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getCurrentWorkspace } from "@/lib/workspace";
import { invalidateTestimonial } from "@/lib/cache";

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const workspace = await getCurrentWorkspace(dbUser.id);
    const body = await request.json();
    const { action, testimonialIds, tags } = body;

    // Verify all testimonials belong to current workspace
    const testimonials = await db.testimonial.findMany({
      where: {
        id: { in: testimonialIds },
        workspaceId: workspace.id,
      },
    });

    if (testimonials.length !== testimonialIds.length) {
      return NextResponse.json(
        { error: "Some testimonials not found or unauthorized" },
        { status: 403 }
      );
    }

    let result;

    switch (action) {
      case "publish":
        result = await db.testimonial.updateMany({
          where: { id: { in: testimonialIds } },
          data: { isPublished: true },
        });
        break;

      case "unpublish":
        result = await db.testimonial.updateMany({
          where: { id: { in: testimonialIds } },
          data: { isPublished: false },
        });
        break;

      case "delete":
        // Invalidate BEFORE deletion so the join lookups still resolve.
        await Promise.all(testimonialIds.map((id: string) => invalidateTestimonial(id)));
        result = await db.testimonial.deleteMany({
          where: { id: { in: testimonialIds } },
        });
        break;

      case "addTags":
        // For each testimonial, merge existing tags with new tags
        for (const testimonial of testimonials) {
          const currentTags = testimonial.tags || [];
          const newTags = Array.from(new Set([...currentTags, ...tags]));
          await db.testimonial.update({
            where: { id: testimonial.id },
            data: { tags: newTags },
          });
        }
        result = { count: testimonials.length };
        break;

      case "removeTags":
        // For each testimonial, remove specified tags
        for (const testimonial of testimonials) {
          const currentTags = testimonial.tags || [];
          const newTags = currentTags.filter((t: string) => !tags.includes(t));
          await db.testimonial.update({
            where: { id: testimonial.id },
            data: { tags: newTags },
          });
        }
        result = { count: testimonials.length };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    // For all non-delete actions (delete already invalidated above), fan out
    // tag invalidation across affected widgets + walls.
    if (action !== "delete") {
      await Promise.all(
        testimonialIds.map((id: string) => invalidateTestimonial(id))
      );
    }

    return NextResponse.json({
      success: true,
      count: result.count || testimonials.length,
      action,
    });
  } catch (error) {
    console.error("Error performing bulk action:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
