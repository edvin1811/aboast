import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { assertCanCreateWorkspace, QuotaError } from "@/lib/quotas";

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

    // Get user's database record
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      include: {
        workspaces: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get current workspace from cookie
    const cookieStore = await cookies();
    const currentWorkspaceId = cookieStore.get("current-workspace")?.value;
    let currentWorkspace = null;

    if (currentWorkspaceId) {
      // Find the workspace from the user's workspaces
      currentWorkspace = dbUser.workspaces.find(w => w.id === currentWorkspaceId) || null;
    }

    // If no workspace in cookie or workspace not found, use the first one
    if (!currentWorkspace && dbUser.workspaces.length > 0) {
      currentWorkspace = dbUser.workspaces[0];
      // Set it in cookie for next time
      cookieStore.set("current-workspace", currentWorkspace.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    return NextResponse.json({
      workspaces: dbUser.workspaces,
      current: currentWorkspace,
    });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
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

    const body = await request.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Get user's database record
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

    // Enforce plan quota (user-level limit on number of workspaces).
    await assertCanCreateWorkspace(dbUser.id);

    // Check if slug is already taken
    const existingWorkspace = await db.workspace.findUnique({
      where: { slug },
    });

    if (existingWorkspace) {
      return NextResponse.json(
        { error: "Workspace slug already exists" },
        { status: 400 }
      );
    }

    // Create workspace
    const workspace = await db.workspace.create({
      data: {
        name,
        slug,
        userId: dbUser.id,
      },
    });

    // Set the new workspace as current in cookie
    const cookieStore = await cookies();
    cookieStore.set("current-workspace", workspace.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    if (error instanceof QuotaError) {
      return NextResponse.json(error.toResponseBody(), { status: 409 });
    }
    console.error("Error creating workspace:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
