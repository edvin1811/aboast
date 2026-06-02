import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getCurrentWorkspace } from "@/lib/workspace";
import { invalidateTestimonial } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get current workspace (from cookie or fallback)
    const workspace = await getCurrentWorkspace(dbUser.id);

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Get testimonials for current workspace only
    const testimonials = await db.testimonial.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    let dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
    });

    // Create user if doesn't exist
    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        },
      });
    }

    // Get current workspace (creates default if none exists)
    const workspace = await getCurrentWorkspace(dbUser.id);

    // Parse request body
    const body = await request.json();

    // Create testimonial in current workspace
    const testimonial = await db.testimonial.create({
      data: {
        content: body.content,
        rating: body.rating || 5,
        authorName: body.authorName,
        authorEmail: body.authorEmail || null,
        authorTitle: body.authorTitle || null,
        authorCompany: body.authorCompany || null,
        authorImage: body.authorImage || null,
        isPublished: body.isPublished || false,
        source: "manual",
        workspaceId: workspace.id,
        userId: dbUser.id,
      },
    });

    if (testimonial.isPublished) {
      await invalidateTestimonial(testimonial.id);
    }

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
