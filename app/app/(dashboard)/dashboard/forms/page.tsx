import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getCurrentWorkspace } from "@/lib/workspace";
import { FormsClient } from "./FormsClient";

export default async function FormsPage() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  let forms: any[] = [];

  // Only query database if DATABASE_URL is set
  if (process.env.DATABASE_URL) {
    try {
      const dbUser = await db.user.findUnique({
        where: { clerkId: user.id },
      });

      if (dbUser) {
        // Get current workspace (from cookie or fallback)
        const workspace = await getCurrentWorkspace(dbUser.id);

        // Get forms for current workspace only, with submission counts so
        // the list rows can render submission rate (submissions / views).
        forms = await db.form.findMany({
          where: { workspaceId: workspace.id },
          orderBy: { createdAt: "desc" },
          include: { _count: { select: { testimonials: true } } },
        });
      }
    } catch (error) {
      console.error("Database error:", error);
    }
  }

  return <FormsClient forms={forms} />;
}
