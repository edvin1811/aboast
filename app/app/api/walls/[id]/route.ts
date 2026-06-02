import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getCurrentWorkspace } from "@/lib/workspace";
import { invalidateWall } from "@/lib/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    const wall = await db.wallOfLove.findFirst({
      where: {
        id,
        workspaceId: workspace.id,
      },
    });

    if (!wall) {
      return NextResponse.json({ error: "Wall not found" }, { status: 404 });
    }

    return NextResponse.json(wall);
  } catch (error) {
    console.error("Error fetching wall:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const body = await request.json();

    const wall = await db.wallOfLove.findFirst({
      where: {
        id,
        workspaceId: workspace.id,
      },
    });

    if (!wall) {
      return NextResponse.json({ error: "Wall not found" }, { status: 404 });
    }

    const updatedWall = await db.wallOfLove.update({
      where: { id },
      data: {
        ...body,
      },
    });

    if (wall.shareId) invalidateWall(wall.shareId);

    return NextResponse.json(updatedWall);
  } catch (error) {
    console.error("Error updating wall:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    const wall = await db.wallOfLove.findFirst({
      where: {
        id,
        workspaceId: workspace.id,
      },
    });

    if (!wall) {
      return NextResponse.json({ error: "Wall not found" }, { status: 404 });
    }

    const shareIdSnapshot = wall.shareId;

    await db.wallOfLove.delete({
      where: { id },
    });

    if (shareIdSnapshot) invalidateWall(shareIdSnapshot);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting wall:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
