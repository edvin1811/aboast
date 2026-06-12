import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getCurrentWorkspace } from "@/lib/workspace";
import { assertCanCreateForm, QuotaError } from "@/lib/quotas";

export async function GET(request: NextRequest) {
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

    // Get or create user
    let dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json([]);
    }

    // Get current workspace
    const workspace = await getCurrentWorkspace(dbUser.id);

    // Get forms for current workspace only
    const forms = await db.form.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(forms);
  } catch (error) {
    console.error("Error fetching forms:", error);
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

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Get or create user
    let dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
    });

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

    // Enforce plan quota before doing any work.
    await assertCanCreateForm(workspace.id);

    // Parse request body
    const body = await request.json();

    // Create form with default fields (textarea, rating, text)
    const defaultFields = [
      { id: "content", type: "textarea", label: "Your Testimonial", required: true, enabled: true },
      { id: "rating", type: "rating", label: "Rating", required: true, enabled: true },
      { id: "name", type: "text", label: "Your Name", required: true, enabled: true },
    ];

    // Generate shareId for public sharing
    const { randomBytes } = require("crypto");
    const shareId = randomBytes(12).toString("base64url");

    // Create form in current workspace
    const form = await db.form.create({
      data: {
        name: body.name,
        slug: body.slug,
        shareId,
        description: body.description || null,
        fields: JSON.stringify(body.fields || defaultFields),
        thankYouMessage: body.thankYouMessage || "Thank you for your testimonial!",
        autoPublish: body.autoPublish || false,
        isActive: body.isActive ?? true,
        workspaceId: workspace.id,
      },
    });

    return NextResponse.json(form, { status: 201 });
  } catch (error) {
    if (error instanceof QuotaError) {
      return NextResponse.json(error.toResponseBody(), { status: 409 });
    }
    console.error("Error creating form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
