import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentWorkspace } from "@/lib/workspace";
import { StudioClient } from "./StudioClient";

export default async function StudioPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const dbUser = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser) {
    redirect("/onboarding");
  }

  const workspace = await getCurrentWorkspace(dbUser.id);

  // Fetch all walls
  const walls = await db.wallOfLove.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
  });

  // Fetch all widgets
  const widgets = await db.widget.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <StudioClient
      walls={walls}
      widgets={widgets}
    />
  );
}