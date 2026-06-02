import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getCurrentWorkspace } from "@/lib/workspace";

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { testimonials } = body;

    if (!testimonials || !Array.isArray(testimonials)) {
      return NextResponse.json(
        { error: "Invalid testimonials data" },
        { status: 400 }
      );
    }

    // Get user's database record
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get current workspace (from cookie or fallback)
    const workspace = await getCurrentWorkspace(dbUser.id);

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Create testimonials in bulk
    const createdTestimonials = await Promise.all(
      testimonials.map(async (testimonial: any) => {
        return db.testimonial.create({
          data: {
            content: testimonial.content,
            rating: testimonial.rating || 5,
            authorName: testimonial.authorName,
            authorEmail: testimonial.authorEmail || null,
            authorTitle: testimonial.authorTitle || null,
            authorCompany: testimonial.authorCompany || null,
            authorImage: testimonial.authorImage || null,
            isPublished: false, // Imported testimonials start as drafts
            tags: testimonial.source ? [testimonial.source] : [],
            workspaceId: workspace.id,
            userId: dbUser.id,
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      count: createdTestimonials.length,
      testimonials: createdTestimonials,
    });
  } catch (error) {
    console.error("Error bulk importing testimonials:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
