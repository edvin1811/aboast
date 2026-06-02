import { NextRequest, NextResponse } from "next/server";
import { getCachedWall, PUBLIC_CACHE_HEADERS } from "@/lib/public-fetchers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const { shareId } = await params;
    const payload = await getCachedWall(shareId);

    if (!payload) {
      return NextResponse.json({ error: "Wall not found" }, { status: 404 });
    }

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": PUBLIC_CACHE_HEADERS.wall,
        "CDN-Cache-Control": PUBLIC_CACHE_HEADERS.wall,
        "Vercel-CDN-Cache-Control": PUBLIC_CACHE_HEADERS.wall,
      },
    });
  } catch (error) {
    console.error("Error fetching public wall:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
