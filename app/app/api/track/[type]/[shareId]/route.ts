import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { rateLimitView } from "@/lib/rate-limit";

// A 43-byte transparent 1×1 GIF — the smallest valid image we can hand
// back to the browser so the `<img src="/api/track/…">` request succeeds.
const TRANSPARENT_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

// Cheap user-agent filter — keeps obvious bots / scrapers / preview cards
// from inflating real visitor counts. Not a security boundary, just a
// signal-quality filter.
const BOT_UA = /bot|crawl|spider|preview|axios|curl|wget|httpx|headlesschrome|phantomjs|slurp|insights|lighthouse/i;

type TrackType = "widget" | "wall" | "form";
const VALID_TYPES = new Set<TrackType>(["widget", "wall", "form"]);

function pixelResponse(status = 200) {
  return new Response(TRANSPARENT_GIF as unknown as BodyInit, {
    status,
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": String(TRANSPARENT_GIF.length),
      // The pixel itself MUST NOT be cached — every visit needs to fire it
      // so each viewer counts independently of the CDN-cached page.
      "Cache-Control": "no-store, must-revalidate",
      "Pragma": "no-cache",
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; shareId: string }> }
) {
  const { type, shareId } = await params;

  if (!VALID_TYPES.has(type as TrackType)) {
    return pixelResponse(400);
  }
  if (!shareId || shareId.length > 64) {
    return pixelResponse(400);
  }
  if (!process.env.DATABASE_URL) {
    return pixelResponse(204);
  }

  const ua = request.headers.get("user-agent") || "";
  if (BOT_UA.test(ua)) {
    return pixelResponse(200);
  }

  const allowed = await rateLimitView(request, shareId);
  if (!allowed) {
    return pixelResponse(200);
  }

  try {
    if (type === "widget") {
      const w = await db.widget.findUnique({ where: { shareId }, select: { id: true } });
      if (w) {
        await db.widget.update({ where: { id: w.id }, data: { views: { increment: 1 } } });
      }
    } else if (type === "wall") {
      const w = await db.wallOfLove.findUnique({ where: { shareId }, select: { id: true } });
      if (w) {
        await db.wallOfLove.update({ where: { id: w.id }, data: { views: { increment: 1 } } });
      }
    } else {
      const f = await db.form.findUnique({ where: { shareId }, select: { id: true } });
      if (f) {
        await db.form.update({ where: { id: f.id }, data: { views: { increment: 1 } } });
      }
    }
  } catch (err) {
    // Never let a tracking failure show through to the visitor. We just
    // return the pixel and move on; tracking is best-effort.
    console.error("track increment failed", { type, shareId, err });
  }

  return pixelResponse(200);
}
