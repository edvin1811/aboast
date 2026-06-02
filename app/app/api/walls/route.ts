import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getCurrentWorkspace } from "@/lib/workspace";
import { randomBytes } from "crypto";

function generateShareId(): string {
  return randomBytes(12).toString("base64url");
}

export async function GET() {
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

    const walls = await db.wallOfLove.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(walls);
  } catch (error) {
    console.error("Error fetching walls:", error);
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

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const workspace = await getCurrentWorkspace(dbUser.id);
    const body = await request.json();

    const {
      name,
      title,
      description,
      layout,
      showRating,
      showDate,
      showCompany,
      columns,
      theme,
    } = body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug already exists
    const existingWall = await db.wallOfLove.findFirst({
      where: {
        slug,
        workspaceId: workspace.id,
      },
    });

    if (existingWall) {
      return NextResponse.json(
        { error: "A wall with this name already exists" },
        { status: 400 }
      );
    }

    const wall = await db.wallOfLove.create({
      data: {
        name,
        slug,
        shareId: generateShareId(),
        title,
        description,
        layout: layout || "masonry",
        showRating: showRating !== undefined ? showRating : true,
        showDate: showDate !== undefined ? showDate : true,
        showCompany: showCompany !== undefined ? showCompany : true,
        columns: columns || 3,
        theme: theme || {
          primaryColor: "#9333ea",
          backgroundColor: "#ffffff",
          textColor: "#000000",
        },
        workspaceId: workspace.id,
      },
    });

    return NextResponse.json(wall, { status: 201 });
  } catch (error) {
    console.error("Error creating wall:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
