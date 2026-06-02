"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ShareDialog } from "@/components/ShareDialog";
import { ExternalLink, Edit } from "lucide-react";
import { GridWidget } from "@/components/widgets/GridWidget";
import { CarouselWidget } from "@/components/widgets/CarouselWidget";
import { BadgeWidget } from "@/components/widgets/BadgeWidget";
import { MasonryWidget } from "@/components/widgets/MasonryWidget";
import { MarqueeWidget } from "@/components/widgets/MarqueeWidget";
import { ListWidget } from "@/components/widgets/ListWidget";
import { FeaturedWidget } from "@/components/widgets/FeaturedWidget";
import { SliderThumbnailsWidget } from "@/components/widgets/SliderThumbnailsWidget";

interface Widget {
  id: string;
  name: string;
  slug: string;
  shareId: string;
  template: string;
  isActive: boolean;
  theme?: any;
  layout?: any;
  widgetTestimonials: Array<{
    testimonial: {
      id: string;
      content: string;
      rating: number;
      authorName: string;
      authorTitle: string | null;
      authorCompany: string | null;
      authorImage: string | null;
    };
  }>;
}

interface WidgetCardProps {
  widget: Widget;
}

export function WidgetCard({ widget }: WidgetCardProps) {
  // Mock testimonials for preview when none are selected
  const mockTestimonials = [
    {
      id: "mock-1",
      content: "This product has completely transformed how we work. The team is more productive and our clients are happier!",
      rating: 5,
      authorName: "Sarah Johnson",
      authorTitle: "CEO",
      authorCompany: "TechCorp",
      authorImage: null,
    },
    {
      id: "mock-2",
      content: "Outstanding service and support. Highly recommend to anyone looking for a reliable solution.",
      rating: 5,
      authorName: "Michael Chen",
      authorTitle: "Product Manager",
      authorCompany: "StartupXYZ",
      authorImage: null,
    },
    {
      id: "mock-3",
      content: "Best investment we've made this year. The ROI has been incredible and implementation was smooth.",
      rating: 4,
      authorName: "Emily Davis",
      authorTitle: "Director of Operations",
      authorCompany: "GlobalInc",
      authorImage: null,
    },
  ];

  // Get testimonials for preview, use mock data if none selected
  const realTestimonials = widget.widgetTestimonials
    .slice(0, 3) // Show max 3 testimonials in preview
    .map((wt) => wt.testimonial);

  const testimonials = realTestimonials.length > 0 ? realTestimonials : mockTestimonials;

  // Get theme or use defaults
  const theme = widget.theme || {};
  const layout = widget.layout || {};

  // Render appropriate widget preview based on template
  const renderPreview = () => {

    const themeProps = {
      primaryColor: theme.primaryColor || "#6366f1",
      backgroundColor: theme.backgroundColor || "#ffffff",
      textColor: theme.textColor || "#1f2937",
      starColor: theme.starColor || "#fbbf24",
    };

    switch (widget.template) {
      case "grid":
        return <GridWidget testimonials={testimonials} theme={themeProps} columns={layout.columns || 2} />;
      case "carousel":
        return <CarouselWidget testimonials={testimonials} theme={themeProps} autoRotate={false} />;
      case "badge":
        return <BadgeWidget testimonials={testimonials} theme={themeProps} />;
      case "masonry":
        return <MasonryWidget testimonials={testimonials} theme={themeProps} />;
      case "marquee":
        return <MarqueeWidget testimonials={testimonials} theme={themeProps} />;
      case "list":
        return <ListWidget testimonials={testimonials} theme={themeProps} />;
      case "featured":
        return <FeaturedWidget testimonials={testimonials} theme={themeProps} />;
      case "slider-thumbnails":
        return <SliderThumbnailsWidget testimonials={testimonials} theme={themeProps} />;
      default:
        return <GridWidget testimonials={testimonials} theme={themeProps} columns={2} />;
    }
  };

  return (
    <Card className="overflow-hidden hover:border-primary transition-all hover:shadow-xl rounded-xl">
      {/* Preview */}
      <div className="bg-gradient-to-br from-primary/5 to-primary-hover/5 p-4 border-b border-border">
        <div className="bg-card rounded-xl p-4 shadow-sm overflow-hidden">
          <div className="scale-[0.6] origin-top-left w-[166%] h-48 ">
            {renderPreview()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1 truncate">
              {widget.name}
            </h3>
            <div className="text-xs text-muted-foreground">
              <span className="capitalize">{widget.template.replace("-", " ")}</span>
              {" • "}
              <span className="font-mono text-primary">/{widget.slug}</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ml-2 ${
            widget.isActive
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          }`}>
            {widget.isActive ? "Active" : "Inactive"}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Link href={`/dashboard/widgets/${widget.id}`}>
            <Button variant="outline" size="sm" className="w-full">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </Link>
          <Link href={`/widget/${widget.shareId}`} target="_blank">
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="h-4 w-4 mr-1" />
              View
            </Button>
          </Link>
          <ShareDialog type="widget" shareId={widget.shareId} name={widget.name} />
        </div>
      </div>
    </Card>
  );
}
