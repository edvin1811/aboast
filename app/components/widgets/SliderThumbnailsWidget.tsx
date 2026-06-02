"use client";

import { useState } from "react";
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

interface SliderThumbnailsWidgetProps {
  testimonials: Testimonial[];
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    starColor?: string;
  };
}

export function SliderThumbnailsWidget({ testimonials, theme }: SliderThumbnailsWidgetProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
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

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="space-y-6">
      {/* Main Display */}
      <div
        className="p-8 rounded-lg shadow-lg border-2"
        style={{
          backgroundColor,
          borderColor: primaryColor,
          color: textColor
        }}
      >
        {/* Rating */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${i < currentTestimonial.rating ? "fill-current" : ""}`}
              style={{ color: i < currentTestimonial.rating ? starColor : "#d1d5db" }}
            />
          ))}
        </div>

        {/* Content */}
        <p className="text-lg leading-relaxed mb-6" style={{ color: textColor }}>
          "{currentTestimonial.content}"
        </p>

        {/* Author */}
        <div className="flex items-center gap-4">
          {currentTestimonial.authorImage ? (
            <img
              src={currentTestimonial.authorImage}
              alt={currentTestimonial.authorName}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {currentTestimonial.authorName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-bold" style={{ color: textColor }}>
              {currentTestimonial.authorName}
            </div>
            {(currentTestimonial.authorTitle || currentTestimonial.authorCompany) && (
              <div className="text-sm opacity-70" style={{ color: textColor }}>
                {currentTestimonial.authorTitle}
                {currentTestimonial.authorTitle && currentTestimonial.authorCompany && " at "}
                {currentTestimonial.authorCompany}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {testimonials.map((testimonial, index) => (
          <button
            key={testimonial.id}
            onClick={() => setCurrentIndex(index)}
            className={`flex-shrink-0 p-4 rounded-lg border-2 transition hover:shadow-md ${
              index === currentIndex ? "shadow-lg" : "opacity-60 hover:opacity-100"
            }`}
            style={{
              backgroundColor,
              borderColor: index === currentIndex ? primaryColor : "#e5e7eb",
              minWidth: "200px"
            }}
          >
            <div className="flex items-center gap-3">
              {testimonial.authorImage ? (
                <img
                  src={testimonial.authorImage}
                  alt={testimonial.authorName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  {testimonial.authorName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left flex-1 min-w-0">
                <div
                  className="font-semibold text-sm truncate"
                  style={{ color: textColor }}
                >
                  {testimonial.authorName}
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < testimonial.rating ? "fill-current" : ""}`}
                      style={{
                        color: i < testimonial.rating ? starColor : "#d1d5db"
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
