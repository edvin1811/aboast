"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  id: string;
  content: string;
  rating: number;
  authorName: string;
  authorTitle?: string | null;
  authorCompany?: string | null;
  authorImage?: string | null;
}

interface FeaturedWidgetProps {
  testimonials: Testimonial[];
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    starColor?: string;
  };
}

export function FeaturedWidget({ testimonials, theme }: FeaturedWidgetProps) {
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

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className="relative px-12 py-16 rounded-2xl shadow-2xl text-center max-w-4xl mx-auto"
      style={{
        backgroundColor,
        color: textColor
      }}
    >
      {/* Quote Icon */}
      <div
        className="text-6xl font-serif mb-6 opacity-20"
        style={{ color: primaryColor }}
      >
        "
      </div>

      {/* Rating */}
      <div className="flex gap-1 justify-center mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-6 w-6 ${i < currentTestimonial.rating ? "fill-current" : ""}`}
            style={{ color: i < currentTestimonial.rating ? starColor : "#d1d5db" }}
          />
        ))}
      </div>

      {/* Content */}
      <p
        className="text-2xl leading-relaxed mb-8 font-medium"
        style={{ color: textColor }}
      >
        {currentTestimonial.content}
      </p>

      {/* Author */}
      <div className="flex flex-col items-center gap-4">
        {currentTestimonial.authorImage ? (
          <img
            src={currentTestimonial.authorImage}
            alt={currentTestimonial.authorName}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold"
            style={{ backgroundColor: primaryColor }}
          >
            {currentTestimonial.authorName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <div className="font-bold text-lg" style={{ color: textColor }}>
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

      {/* Navigation */}
      {testimonials.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 transition"
            style={{ color: primaryColor }}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 transition"
            style={{ color: primaryColor }}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {testimonials.length > 1 && (
        <div className="flex gap-2 justify-center mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className="w-2 h-2 rounded-full transition"
              style={{
                backgroundColor: index === currentIndex ? primaryColor : "#d1d5db"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
