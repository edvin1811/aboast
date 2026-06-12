import { NextRequest } from "next/server";

/**
 * Drop-in embed loader.
 *
 * Customers paste:
 *     <script async src="https://app.aboast.com/widget/SHAREID/embed.js"></script>
 *
 * This route returns a tiny JS snippet that:
 *   1. Finds itself in the DOM
 *   2. Replaces the <script> with an <iframe> pointing at the widget page
 *   3. Listens for `aboast:height` postMessages from the iframe and resizes
 *
 * Public, no auth. Cached at the edge for a day — the loader itself almost
 * never changes; if we need to push a new version we can use a different
 * `embed.js` URL or revalidate by deploying a new build.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;

  // Basic validation — keep the route from being abused to bounce
  // arbitrary attacker-controlled strings into a JS payload.
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(shareId)) {
    return new Response("/* invalid shareId */", {
      status: 400,
      headers: { "Content-Type": "application/javascript; charset=utf-8" },
    });
  }

  const origin = new URL(request.url).origin;
  const iframeSrc = `${origin}/widget/${shareId}`;

  // The shareId has been validated above to contain only [a-zA-Z0-9_-],
  // so it's safe to interpolate into the script body as a quoted literal.
  const js = `(function () {
  var SHARE_ID = ${JSON.stringify(shareId)};
  var IFRAME_SRC = ${JSON.stringify(iframeSrc)};
  var DEFAULT_HEIGHT = 600;
  var current = document.currentScript || (function () {
    var all = document.getElementsByTagName("script");
    return all[all.length - 1];
  })();
  if (!current) return;

  var iframe = document.createElement("iframe");
  iframe.src = IFRAME_SRC;
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("scrolling", "no");
  iframe.setAttribute("allowtransparency", "true");
  iframe.setAttribute("title", "Aboast widget");
  iframe.style.width = "100%";
  iframe.style.maxWidth = "100%";
  iframe.style.display = "block";
  iframe.style.border = "0";
  iframe.style.height = DEFAULT_HEIGHT + "px";
  iframe.dataset.aboastShareId = SHARE_ID;

  current.parentNode.insertBefore(iframe, current);
  current.parentNode.removeChild(current);

  window.addEventListener("message", function (event) {
    var data = event && event.data;
    if (!data || data.type !== "aboast:height") return;
    if (data.shareId !== SHARE_ID) return;
    var h = parseInt(data.height, 10);
    if (!isFinite(h) || h <= 0 || h > 20000) return;
    iframe.style.height = h + "px";
  });
})();`;

  return new Response(js, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      // Cache aggressively — the loader content depends only on shareId,
      // and even that just embeds it as a string. If we need to invalidate,
      // bump the cache key by changing the route path or redeploying.
      "Cache-Control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800",
      "CDN-Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      "Vercel-CDN-Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      // The loader is JS, not HTML; an attacker can't iframe it. Still
      // mark it so it doesn't get treated as a document.
      "X-Content-Type-Options": "nosniff",
    },
  });
}
