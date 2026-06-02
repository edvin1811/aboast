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

interface MarqueeWidgetProps {
  testimonials: Testimonial[];
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    starColor?: string;
  };
}

export function MarqueeWidget({ testimonials, theme }: MarqueeWidgetProps) {
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

  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <div className="relative overflow-hidden">
      <div className="flex animate-marquee hover:pause">
        {duplicatedTestimonials.map((testimonial, index) => (
          <div
            key={`${testimonial.id}-${index}`}
            className="flex-shrink-0 w-80 mx-3 p-6 rounded-lg shadow-md border"
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
            <p
              className="mb-4 leading-relaxed line-clamp-4"
              style={{ color: textColor }}
            >
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

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 30s linear infinite;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
