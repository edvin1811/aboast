import { notFound } from "next/navigation";
import { getCachedWidget } from "@/lib/public-fetchers";
import { GridWidget } from "@/components/widgets/GridWidget";
import { CarouselWidget } from "@/components/widgets/CarouselWidget";

// 60s ISR + edge cache; dashboard mutations call invalidateWidget(shareId) for
// instant freshness when something actually changes.
export const revalidate = 60;

export default async function WidgetPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;

  if (!process.env.DATABASE_URL) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Database Not Connected</h2>
          <p className="text-muted-foreground">Please configure DATABASE_URL</p>
        </div>
      </div>
    );
  }

  let widget: Awaited<ReturnType<typeof getCachedWidget>> = null;
  try {
    widget = await getCachedWidget(shareId);
  } catch (error) {
    console.error("Error loading widget:", error);
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Widget</h2>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!widget || !widget.isActive) notFound();

  const testimonials = widget.widgetTestimonials
    .map((wt) => wt.testimonial)
    .filter((t) => t.isPublished);

  const theme = typeof widget.theme === "object" ? widget.theme : {};
  const layout = typeof widget.layout === "object" ? widget.layout : {};

  switch (widget.template) {
    case "carousel":
      return (
        <CarouselWidget
          testimonials={testimonials}
          theme={theme as any}
          autoRotate={widget.autoRotate}
          rotateInterval={widget.rotateInterval || 5000}
        />
      );
    case "grid":
    default:
      return (
        <GridWidget
          testimonials={testimonials}
          theme={theme as any}
          columns={(layout as any)?.columns || 3}
        />
      );
  }
}
