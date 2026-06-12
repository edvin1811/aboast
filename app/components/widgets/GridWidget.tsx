import { Star } from "lucide-react";

interface Testimonial {
  id: string;
  content: string;
  rating: number;
  authorName: string;
  authorTitle?: string | null;
  authorCompany?: string | null;
  authorImage?: string | null;
  createdAt?: Date;
}

interface GridWidgetProps {
  testimonials: Testimonial[];
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    starColor?: string;
  };
  columns?: number;
}

export function GridWidget({
  testimonials,
  theme = {},
  columns = 3
}: GridWidgetProps) {
  const {
    primaryColor = "#ff595e",
    backgroundColor = "#ffffff",
    textColor = "#0a0a0a",
    starColor = "#ff595e",
  } = theme;

  return (
    <div
      className="w-full p-6"
      style={{ backgroundColor }}
    >
      <div
        className={`grid gap-6`}
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="rounded-2xl p-6 border transition-all hover:shadow-[0_8px_24px_-12px_rgba(15,15,15,0.12)]"
            style={{
              backgroundColor,
              borderColor: `${primaryColor}20`,
              color: textColor,
              boxShadow:
                "0 1px 2px rgba(15,15,15,0.04), 0 8px 24px -12px rgba(15,15,15,0.08)",
            }}
          >
            {/* Rating */}
            <div className="flex gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4"
                  style={{
                    color: i < testimonial.rating ? starColor : "#d1d5db",
                    fill: i < testimonial.rating ? starColor : "transparent",
                  }}
                />
              ))}
            </div>

            {/* Content */}
            <p className="text-sm mb-4 leading-relaxed">
              "{testimonial.content}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: `${primaryColor}20` }}>
              {testimonial.authorImage ? (
                <img
                  src={testimonial.authorImage}
                  alt={testimonial.authorName}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {testimonial.authorName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-semibold text-sm">{testimonial.authorName}</div>
                {(testimonial.authorTitle || testimonial.authorCompany) && (
                  <div className="text-xs opacity-75">
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
    </div>
  );
}
