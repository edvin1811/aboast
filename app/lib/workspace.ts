import { cookies } from "next/headers";
import { db } from "@/lib/db";

/**
 * Get the current workspace for a user based on the cookie or fallback to first workspace
 */
export async function getCurrentWorkspace(userId: string) {
  // Get current workspace ID from cookie
  const cookieStore = await cookies();
  const currentWorkspaceId = cookieStore.get("current-workspace")?.value;

  console.log("[getCurrentWorkspace] Cookie workspace ID:", currentWorkspaceId);

  let workspace = null;

  // Try to find the workspace from cookie
  if (currentWorkspaceId) {
    workspace = await db.workspace.findFirst({
      where: {
        id: currentWorkspaceId,
        userId: userId, // Ensure it belongs to the user
      },
    });
    console.log("[getCurrentWorkspace] Found workspace from cookie:", workspace?.name);
  }

  // If no workspace from cookie or not found, get the first workspace
  if (!workspace) {
    workspace = await db.workspace.findFirst({
      where: { userId: userId },
      orderBy: { createdAt: "asc" },
    });
    console.log("[getCurrentWorkspace] Using first workspace:", workspace?.name);
  }

  // If still no workspace, create a default one
  if (!workspace) {
    workspace = await db.workspace.create({
      data: {
        name: "My Workspace",
        slug: `workspace-${userId}`,
        userId: userId,
      },
    });
    console.log("[getCurrentWorkspace] Created default workspace:", workspace.name);

    // Set it as current in cookie
    cookieStore.set("current-workspace", workspace.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  console.log("[getCurrentWorkspace] Returning workspace:", workspace.name, workspace.id);
  return workspace;
}
