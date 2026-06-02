import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";

/**
 * Rate-limit helpers for the public, unauthenticated endpoints.
 *
 * Backed by Upstash Redis (via Vercel's Upstash Marketplace integration).
 * Reads either the new `UPSTASH_REDIS_REST_*` env var names (Vercel
 * Marketplace integration, 2025+) or the legacy `KV_REST_API_*` names
 * (deprecated `@vercel/kv` integration). When neither is present — e.g.
 * local dev — every request resolves to `allowed: true` so the app keeps
 * working without external infra.
 */

const redisUrl =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const redis = redisUrl && redisToken
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

function makeLimiter(limit: number, windowSeconds: `${number} s`, prefix: string) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
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
