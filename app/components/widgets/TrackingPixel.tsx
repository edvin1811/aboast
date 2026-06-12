/**
 * 1×1 transparent pixel that fires a GET to /api/track/[type]/[shareId]
 * from every visitor's browser. Sits off-screen and is hidden from
 * assistive tech. Embedded inside the public widget / wall / submit
 * pages so view counts increment per VIEWER even when the page itself
 * is served from the CDN cache.
 *
 * Server-renderable — just a plain `<img>` tag, no client JS needed.
 */
export function TrackingPixel({
  type,
  shareId,
}: {
  type: "widget" | "wall" | "form";
  shareId: string;
}) {
  return (
    <img
      src={`/api/track/${type}/${shareId}`}
      width={1}
      height={1}
      alt=""
      aria-hidden="true"
      loading="eager"
      style={{
        position: "absolute",
        left: "-9999px",
        top: 0,
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: "none",
      }}
    />
  );
}
