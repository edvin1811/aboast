import { NextRequest, NextResponse } from "next/server";
import { getCachedForm } from "@/lib/public-fetchers";
import { rateLimitForm } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { limitsFor } from "@/lib/plans";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    if (!(await rateLimitForm(request))) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const { shareId } = await params;
    const form = await getCachedForm(shareId);

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Plan + current testimonial count come fresh on every request — the
    // cached form holds only what's stable (fields, slugs). Keeps "form is
    // closed" + watermark logic correct without piping cache invalidations
    // through Stripe events.
    const [ws, currentTestimonials] = await Promise.all([
      db.workspace.findUnique({
        where: { id: form.workspaceId },
        select: { user: { select: { plan: true } } },
      }),
      db.testimonial.count({ where: { workspaceId: form.workspaceId } }),
    ]);

    const ownerPlan = (ws?.user.plan ?? "FREE") as "FREE" | "PRO";
    const limit = limitsFor(ownerPlan).testimonials;
    const isClosed =
      Number.isFinite(limit) && currentTestimonials >= (limit as number);

    return NextResponse.json(
      { ...form, ownerPlan, isClosed },
      {
        headers: {
          // Don't cache the merged response — plan + isClosed are dynamic.
          // The form fields stay cached one layer down inside getCachedForm.
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
