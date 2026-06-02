import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentWorkspace } from "@/lib/workspace";
import { WallsClient } from "./WallsClient";

export default async function WallsPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) {
    redirect("/sign-in");
  }

  const workspace = await getCurrentWorkspace(dbUser.id);

  const walls = await db.wallOfLove.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
  });

  const testimonialsCount = await db.testimonial.count({
    where: {
      workspaceId: workspace.id,
      isPublished: true,
    },
  });

  return <WallsClient walls={walls} testimonialsCount={testimonialsCount} />;
}
