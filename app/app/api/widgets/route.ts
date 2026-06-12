import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getCurrentWorkspace } from "@/lib/workspace";
import { assertCanCreateWidget, QuotaError } from "@/lib/quotas";

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
      return NextResponse.json([]);
    }

    // Get current workspace
    const workspace = await getCurrentWorkspace(dbUser.id);

    // Get widgets for current workspace only
    const widgets = await db.widget.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(widgets);
  } catch (error) {
    console.error("Error fetching widgets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[API /api/widgets POST] Request received");

    const user = await currentUser();

    if (!user) {
      console.log("[API /api/widgets POST] Unauthorized - no user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[API /api/widgets POST] User:", user.id);

    if (!process.env.DATABASE_URL) {
      console.log("[API /api/widgets POST] Database not configured");
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
      console.log("[API /api/widgets POST] Creating new user");
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

    console.log("[API /api/widgets POST] DB User:", dbUser.id);

    // Get current workspace (creates default if none exists)
    const workspace = await getCurrentWorkspace(dbUser.id);
    console.log("[API /api/widgets POST] Workspace for widget creation:", workspace.name, workspace.id);

    // Enforce plan quota.
    await assertCanCreateWidget(workspace.id);

    // Parse request body
    const body = await request.json();
    console.log("[API /api/widgets POST] Request body:", body);

    // Generate shareId for public sharing
    const { randomBytes } = require("crypto");
    const shareId = randomBytes(12).toString("base64url");

    // Create widget in current workspace
    const widget = await db.widget.create({
      data: {
        name: body.name,
        slug: body.slug,
        shareId,
        template: body.template || "grid",
        isActive: body.isActive ?? true,
        autoRotate: body.autoRotate || false,
        rotateInterval: body.rotateInterval || null,
        theme: body.theme || {},
        layout: body.layout || {},
        showRating: body.showRating ?? true,
        showAuthorImage: body.showAuthorImage ?? true,
        showDate: body.showDate ?? false,
        workspaceId: workspace.id,
      },
    });

    console.log("[API /api/widgets POST] Widget created successfully:", widget.id, "in workspace:", workspace.name);

    return NextResponse.json(widget, { status: 201 });
  } catch (error) {
    if (error instanceof QuotaError) {
      return NextResponse.json(error.toResponseBody(), { status: 409 });
    }
    console.error("[API /api/widgets POST] Error creating widget:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
