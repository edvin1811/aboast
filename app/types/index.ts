import { Prisma } from "@prisma/client";

// Testimonial with relations
export type TestimonialWithRelations = Prisma.TestimonialGetPayload<{
  include: {
    workspace: true;
    user: true;
    form: true;
  };
}>;

// Widget with relations
export type WidgetWithRelations = Prisma.WidgetGetPayload<{
  include: {
    workspace: true;
    widgetTestimonials: {
      include: {
        testimonial: true;
      };
    };
  };
}>;

// Widget theme type
export type WidgetTheme = {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  starColor: string;
  borderRadius: string;
  fontFamily: string;
};

// Widget layout type
export type WidgetLayout = {
  columns?: number;
  gap?: number;
  cardStyle?: "default" | "bordered" | "elevated";
  animationStyle?: "fade" | "slide" | "none";
};

// Form submission type
export type TestimonialSubmission = {
  content: string;
  rating: number;
  authorName: string;
  authorEmail?: string;
  authorTitle?: string;
  authorCompany?: string;
  authorImage?: string;
  videoUrl?: string;
  imageUrl?: string;
};
