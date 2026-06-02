"use client";

import { Star } from "lucide-react";

interface Testimonial {
  id: string;
  content: string;
  rating: number;
  authorName: string;
  authorTitle?: string | null;
  authorCompany?: string | null;
  authorImage?: string | null;
}

interface ListWidgetProps {
  testimonials: Testimonial[];
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    starColor?: string;
  };
}

export function ListWidget({ testimonials, theme }: ListWidgetProps) {
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

  return (
    <div className="space-y-4">
      {testimonials.map((testimonial) => (
        <div
          key={testimonial.id}
          className="flex gap-4 p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
          style={{
            backgroundColor,
            borderColor: `${primaryColor}20`,
            color: textColor
          }}
        >
          {/* Author Avatar */}
          {testimonial.authorImage ? (
            <img
              src={testimonial.authorImage}
              alt={testimonial.authorName}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              {testimonial.authorName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-semibold" style={{ color: textColor }}>
                  {testimonial.authorName}
                </div>
                {(testimonial.authorTitle || testimonial.authorCompany) && (
                  <div className="text-sm opacity-70" style={{ color: textColor }}>
                    {testimonial.authorTitle}
                    {testimonial.authorTitle && testimonial.authorCompany && " at "}
                    {testimonial.authorCompany}
                  </div>
                )}
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < testimonial.rating ? "fill-current" : ""}`}
                    style={{ color: i < testimonial.rating ? starColor : "#d1d5db" }}
                  />
                ))}
              </div>
            </div>
            <p className="leading-relaxed" style={{ color: textColor }}>
              "{testimonial.content}"
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
