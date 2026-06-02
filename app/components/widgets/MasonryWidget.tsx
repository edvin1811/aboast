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

interface MasonryWidgetProps {
  testimonials: Testimonial[];
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    starColor?: string;
  };
}

export function MasonryWidget({ testimonials, theme }: MasonryWidgetProps) {
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
    <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
      {testimonials.map((testimonial) => (
        <div
          key={testimonial.id}
          className="break-inside-avoid mb-4 rounded-lg p-6 shadow-md border hover:shadow-xl transition-shadow"
          style={{
            backgroundColor,
            borderColor: `${primaryColor}20`,
            color: textColor
          }}
        >
          {/* Rating */}
          <div className="flex gap-0.5 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < testimonial.rating ? "fill-current" : ""}`}
                style={{ color: i < testimonial.rating ? starColor : "#d1d5db" }}
              />
            ))}
          </div>

          {/* Content */}
          <p className="mb-4 leading-relaxed" style={{ color: textColor }}>
            "{testimonial.content}"
          </p>

          {/* Author */}
          <div className="flex items-center gap-3">
            {testimonial.authorImage ? (
              <img
                src={testimonial.authorImage}
                alt={testimonial.authorName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: primaryColor }}
              >
                {testimonial.authorName.charAt(0).toUpperCase()}
              </div>
            )}
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
          </div>
        </div>
      ))}
    </div>
  );
}
