"use client";

import { useState, useEffect } from "react";
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

interface CarouselWidgetProps {
  testimonials: Testimonial[];
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    starColor?: string;
  };
  autoRotate?: boolean;
  rotateInterval?: number;
}

export function CarouselWidget({
  testimonials,
  theme = {},
  autoRotate = false,
  rotateInterval = 5000,
}: CarouselWidgetProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const {
    primaryColor = "#ff595e",
    backgroundColor = "#ffffff",
    textColor = "#0a0a0a",
    starColor = "#ff595e",
  } = theme;

  useEffect(() => {
    if (!autoRotate || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [autoRotate, rotateInterval, testimonials.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  if (testimonials.length === 0) {
    return <div className="p-6 text-center">No testimonials to display</div>;
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div
      className="w-full p-8"
      style={{ backgroundColor }}
    >
      <div className="max-w-4xl mx-auto relative">
        {/* Navigation Arrows */}
        {testimonials.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-2 rounded-full transition-opacity hover:opacity-80"
              style={{ backgroundColor: primaryColor }}
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-2 rounded-full transition-opacity hover:opacity-80"
              style={{ backgroundColor: primaryColor }}
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
          </>
        )}

        {/* Testimonial Card */}
        <div
          className="rounded-2xl p-8 md:p-10 text-center"
          style={{
            backgroundColor,
            color: textColor,
            border: `1px solid ${primaryColor}20`,
            boxShadow:
              "0 1px 2px rgba(15,15,15,0.04), 0 24px 48px -24px rgba(15,15,15,0.16)",
          }}
        >
          {/* Rating */}
          <div className="flex gap-1 justify-center mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-5 w-5"
                style={{
                  color: i < currentTestimonial.rating ? starColor : "#d1d5db",
                  fill: i < currentTestimonial.rating ? starColor : "transparent",
                }}
              />
            ))}
          </div>

          {/* Content */}
          <p className="text-lg mb-6 leading-relaxed max-w-2xl mx-auto">
            "{currentTestimonial.content}"
          </p>

          {/* Author */}
          <div className="flex items-center justify-center gap-4">
            {currentTestimonial.authorImage ? (
              <img
                src={currentTestimonial.authorImage}
                alt={currentTestimonial.authorName}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: primaryColor }}
              >
                {currentTestimonial.authorName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-left">
              <div className="font-semibold">{currentTestimonial.authorName}</div>
              {(currentTestimonial.authorTitle || currentTestimonial.authorCompany) && (
                <div className="text-sm opacity-75">
                  {currentTestimonial.authorTitle}
                  {currentTestimonial.authorTitle && currentTestimonial.authorCompany && " at "}
                  {currentTestimonial.authorCompany}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dots Indicator */}
        {testimonials.length > 1 && (
          <div className="flex gap-2 justify-center mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="h-2 rounded-full transition-all"
                style={{
                  width: index === currentIndex ? "24px" : "8px",
                  backgroundColor: index === currentIndex ? primaryColor : `${primaryColor}40`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
