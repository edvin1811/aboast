import { notFound } from "next/navigation";
import { Star, Calendar, Building2 } from "lucide-react";
import { getCachedWall } from "@/lib/public-fetchers";
import { TrackingPixel } from "@/components/widgets/TrackingPixel";
import { IframeAutoResize } from "@/components/widgets/IframeAutoResize";

// 60s ISR; dashboard mutations call invalidateWall(shareId) for instant freshness.
export const revalidate = 60;

export default async function WallOfLovePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;

  if (!process.env.DATABASE_URL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
            Database not configured
          </h2>
        </div>
      </div>
    );
  }

  const payload = await getCachedWall(shareId).catch((err) => {
    console.error("Error loading wall:", err);
    return null;
  });

  if (!payload) notFound();

  const { wall, testimonials, ownerPlan } = payload;
  const themeRaw = wall.theme as unknown;
  const theme =
    typeof themeRaw === "string"
      ? JSON.parse(themeRaw)
      : (themeRaw as Record<string, string> | null) || {};
  const primaryColor = theme.primaryColor || "#ff595e";

  // Tailwind needs class names statically; map column count via inline grid template.
  const gridStyle =
    wall.layout === "masonry"
      ? { columnCount: wall.columns, columnGap: "1.5rem" }
      : wall.layout === "grid"
        ? {
            display: "grid",
            gridTemplateColumns: `repeat(${wall.columns}, minmax(0, 1fr))`,
            gap: "1.5rem",
          }
        : undefined;

  return (
    <div
      className="min-h-screen py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-white"
      style={{
        backgroundColor: theme.backgroundColor || undefined,
        color: theme.textColor || undefined,
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground leading-[1.1] mb-4">
            {wall.title || "Wall of love"}
          </h1>
          {wall.description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {wall.description}
            </p>
          )}
          <div className="inline-flex items-center gap-2 mt-6 px-3 py-1.5 rounded-full border border-border bg-white text-xs text-muted-foreground">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: primaryColor }}
            />
            {testimonials.length}{" "}
            {testimonials.length === 1 ? "testimonial" : "testimonials"}
            <span className="text-muted-foreground/50">·</span>
            <span>from {wall.workspace.name}</span>
          </div>
        </div>

        {/* Testimonials Grid */}
        {testimonials.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground">No testimonials yet. Check back soon.</p>
          </div>
        ) : (
          <div style={gridStyle} className={wall.layout === "list" ? "space-y-6" : ""}>
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="break-inside-avoid mb-6 last:mb-0"
              >
                <div className="bg-white rounded-2xl p-6 border border-border shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)] h-full flex flex-col">
                  {wall.showRating && (
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-3.5 w-3.5"
                          style={{
                            color:
                              i < testimonial.rating ? primaryColor : "#e5e5e5",
                            fill:
                              i < testimonial.rating
                                ? primaryColor
                                : "transparent",
                          }}
                          strokeWidth={i < testimonial.rating ? 0 : 1.5}
                        />
                      ))}
                    </div>
                  )}

                  <p className="text-foreground leading-relaxed mb-6 flex-1">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>

                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    {testimonial.authorImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={testimonial.authorImage}
                        alt={testimonial.authorName}
                        className="h-11 w-11 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div
                        className="h-11 w-11 rounded-full flex items-center justify-center font-semibold text-sm border"
                        style={{
                          backgroundColor: `${primaryColor}1A`,
                          color: primaryColor,
                          borderColor: `${primaryColor}40`,
                        }}
                      >
                        {testimonial.authorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {testimonial.authorName}
                      </div>
                      {testimonial.authorTitle && (
                        <div className="text-sm text-muted-foreground truncate">
                          {testimonial.authorTitle}
                          {wall.showCompany && testimonial.authorCompany && (
                            <>
                              {" · "}
                              <span className="inline-flex items-center gap-1">
                                <Building2
                                  className="h-3 w-3"
                                  strokeWidth={1.75}
                                />
                                {testimonial.authorCompany}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                      {wall.showDate && (
                        <div className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" strokeWidth={1.75} />
                          {new Date(testimonial.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer — only on FREE-tier workspaces */}
        {ownerPlan !== "PRO" && (
          <div className="text-center mt-16 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Want a wall like this?{" "}
              <a
                href="/"
                className="font-medium hover:underline"
                style={{ color: primaryColor }}
              >
                Try aboast free
              </a>
            </p>
          </div>
        )}
      </div>
      <TrackingPixel type="wall" shareId={shareId} />
      <IframeAutoResize shareId={shareId} />
    </div>
  );
}
