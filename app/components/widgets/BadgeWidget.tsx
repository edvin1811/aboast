"use client";

import { Star } from "lucide-react";

interface Testimonial {
  id: string;
  content: string;
  rating: number;
  authorName: string;
  authorImage?: string | null;
}

interface BadgeWidgetProps {
  testimonials: Testimonial[];
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    starColor?: string;
  };
}

export function BadgeWidget({ testimonials, theme }: BadgeWidgetProps) {
  const primaryColor = theme?.primaryColor || "#6366f1";
  const backgroundColor = theme?.backgroundColor || "#ffffff";
  const textColor = theme?.textColor || "#1f2937";
  const starColor = theme?.starColor || "#fbbf24";

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No testimonials to display
      </div>
    );
  }

  // Calculate average rating
  const avgRating = testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length;
  const reviewCount = testimonials.length;

  // Get first 3 unique avatars
  const avatars = testimonials
    .filter(t => t.authorImage)
    .slice(0, 3)
    .map(t => ({ name: t.authorName, image: t.authorImage }));

  return (
    <div
      className="inline-flex items-center gap-4 px-6 py-4 rounded-full shadow-lg border-2"
      style={{
        backgroundColor,
        borderColor: primaryColor,
        color: textColor
      }}
    >
      {/* Avatar Stack */}
      {avatars.length > 0 && (
        <div className="flex -space-x-2">
          {avatars.map((avatar, index) => (
            <div
              key={index}
              className="w-10 h-10 rounded-full border-2 bg-gray-200 flex items-center justify-center overflow-hidden"
              style={{ borderColor: backgroundColor, zIndex: 10 - index }}
            >
              {avatar.image ? (
                <img
                  src={avatar.image}
                  alt={avatar.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold" style={{ color: primaryColor }}>
                  {avatar.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rating and Count */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(avgRating) ? "fill-current" : ""
                }`}
                style={{ color: i < Math.round(avgRating) ? starColor : "#d1d5db" }}
              />
            ))}
          </div>
          <span className="font-bold text-lg" style={{ color: textColor }}>
            {avgRating.toFixed(1)}
          </span>
        </div>
        <p className="text-sm opacity-75" style={{ color: textColor }}>
          Based on <span className="font-semibold">{reviewCount}</span> reviews
        </p>
      </div>
    </div>
  );
}
