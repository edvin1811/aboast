import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getCurrentWorkspace } from "@/lib/workspace";
import { limitsFor } from "@/lib/plans";

export const dynamic = "force-dynamic";

/**
 * Returns the current user's plan + per-resource usage so the dashboard can
 * render plan badges, soft-nudge banners, and gate UI without hitting
 * count endpoints ad-hoc.
 *
 * Usage shape:
 *   workspaces is at the user level (count of workspaces the user owns).
 *   forms/widgets/walls/testimonials are scoped to the user's CURRENT workspace
 *   (the one from the cookie / first by createdAt).
 */
export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
    select: {
      id: true,
      plan: true,
      currentPeriodEnd: true,
      stripeCustomerId: true,
    },
  });
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const workspace = await getCurrentWorkspace(dbUser.id);

  const [workspaces, forms, widgets, walls, testimonials] = await Promise.all([
    db.workspace.count({ where: { userId: dbUser.id } }),
    db.form.count({ where: { workspaceId: workspace.id } }),
    db.widget.count({ where: { workspaceId: workspace.id } }),
    db.wallOfLove.count({ where: { workspaceId: workspace.id } }),
    db.testimonial.count({ where: { workspaceId: workspace.id } }),
  ]);

  return NextResponse.json({
    plan: dbUser.plan,
    currentPeriodEnd: dbUser.currentPeriodEnd,
    hasStripeCustomer: Boolean(dbUser.stripeCustomerId),
    limits: limitsFor(dbUser.plan),
    usage: {
      workspaces,
      forms,
      widgets,
      walls,
      testimonials,
    },
    workspaceId: workspace.id,
  });
}
