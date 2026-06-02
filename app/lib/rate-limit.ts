import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import type { NextRequest } from "next/server";

/**
 * Rate-limit helpers for the public, unauthenticated endpoints.
 *
 * Backed by Vercel KV (Upstash Redis under the hood). When the KV env vars are
 * missing — e.g. local dev — every request resolves to `success: true` so the
 * app keeps working without external infra.
 */

const isKvConfigured = Boolean(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_KV_REST_API_TOKEN ||
    process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

function makeLimiter(limit: number, windowSeconds: `${number} s`, prefix: string) {
  if (!isKvConfigured) return null;
  return new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(limit, windowSeconds),
    prefix,
    analytics: false,
  });
}

// /api/submissions — 10 per minute per IP, 50 per minute per shareId.
const submissionByIp = makeLimiter(10, "60 s", "rl:sub:ip");
const submissionByShareId = makeLimiter(50, "60 s", "rl:sub:share");

// /api/forms/public/[shareId] — 60 per minute per IP. Loose; legit traffic
// hits the CDN cache layer anyway, this is just abuse protection.
const formByIp = makeLimiter(60, "60 s", "rl:form:ip");

export function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous"
  );
}

export async function rateLimitSubmission(
  req: NextRequest,
  shareId: string
): Promise<{ allowed: boolean; reason?: string }> {
  if (!submissionByIp || !submissionByShareId) return { allowed: true };

  const ip = getIp(req);
  const [byIp, byShare] = await Promise.all([
    submissionByIp.limit(ip),
    submissionByShareId.limit(shareId),
  ]);

  if (!byIp.success) return { allowed: false, reason: "ip" };
  if (!byShare.success) return { allowed: false, reason: "share" };
  return { allowed: true };
}

export async function rateLimitForm(req: NextRequest): Promise<boolean> {
  if (!formByIp) return true;
  const ip = getIp(req);
  const { success } = await formByIp.limit(ip);
  return success;
}
