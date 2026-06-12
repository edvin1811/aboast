import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invalidateTestimonial } from "@/lib/cache";
import { rateLimitSubmission } from "@/lib/rate-limit";
import { assertCanCreateTestimonial, QuotaError } from "@/lib/quotas";

const MAX_BODY_BYTES = 16 * 1024; // 16 KB cap on submission payloads.

export async function POST(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Reject oversized payloads early so a single bad client can't blow up the route.
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Payload too large" },
        { status: 413 }
      );
    }

    const body = await request.json();

    if (!body?.formShareId || typeof body.formShareId !== "string") {
      return NextResponse.json(
        { error: "Missing form reference" },
        { status: 400 }
      );
    }

    const rl = await rateLimitSubmission(request, body.formShareId);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many submissions, please try again later." },
        { status: 429 }
      );
    }

    // Get form
    const form = await db.form.findUnique({
      where: { shareId: body.formShareId },
      include: {
        workspace: true,
      },
    });

    if (!form || !form.isActive) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Enforce workspace testimonial quota. Submitter sees a "closed" message
    // rather than a paywall — they aren't the customer.
    try {
      await assertCanCreateTestimonial(form.workspaceId);
    } catch (err) {
      if (err instanceof QuotaError) {
        return NextResponse.json(
          { error: "form_closed", reason: "workspace_at_capacity" },
          { status: 403 }
        );
      }
      throw err;
    }

    // Extract data from submission
    const {
      rating = 5,
      content = "",
      authorName = "",
      authorEmail = null,
      authorTitle = null,
      authorCompany = null,
      authorImage = null,
    } = body;

    // Create testimonial with form's default tags
    const testimonial = await db.testimonial.create({
      data: {
        content: content || "No content provided",
        rating,
        authorName: authorName || "Anonymous",
        authorEmail,
        authorTitle,
        authorCompany,
        authorImage,
        isPublished: form.autoPublish,
        source: "form",
        tags: form.defaultTags || [], // Auto-apply form's default tags
        workspaceId: form.workspaceId,
        userId: form.workspace.userId,
        formId: form.id,
      },
    });

    // If the form auto-publishes, fan-out invalidation so the widget/wall
    // caches refresh within seconds instead of waiting on the 60s TTL.
    if (testimonial.isPublished) {
      await invalidateTestimonial(testimonial.id);
    }

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
