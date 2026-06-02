import { NextRequest, NextResponse } from "next/server";
import { getCachedForm, PUBLIC_CACHE_HEADERS } from "@/lib/public-fetchers";
import { rateLimitForm } from "@/lib/rate-limit";

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

    return NextResponse.json(form, {
      headers: {
        "Cache-Control": PUBLIC_CACHE_HEADERS.form,
        "CDN-Cache-Control": PUBLIC_CACHE_HEADERS.form,
        "Vercel-CDN-Cache-Control": PUBLIC_CACHE_HEADERS.form,
      },
    });
  } catch (error) {
    console.error("Error fetching form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
