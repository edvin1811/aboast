import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getCurrentWorkspace } from "@/lib/workspace";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Upload, Star } from "lucide-react";
import { TestimonialsClient } from "./TestimonialsClient";
import { PageBanner } from "../../components/PageBanner";

export default async function TestimonialsPage() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  let testimonials: any[] = [];

  if (process.env.DATABASE_URL) {
    try {
      const dbUser = await db.user.findUnique({
        where: { clerkId: user.id },
      });

      if (dbUser) {
        const workspace = await getCurrentWorkspace(dbUser.id);

        testimonials = await db.testimonial.findMany({
          where: { workspaceId: workspace.id },
          include: {
            form: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
      }
    } catch (error) {
      console.error("Database error:", error);
    }
  }

  const testimonialCount = testimonials.length;
  const publishedCount = testimonials.filter((t) => t.isPublished).length;
  const avgRating = testimonials.length > 0
    ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
    : 0;

  return (
    <div className="space-y-12">
      <PageBanner
        eyebrow="Manage"
        title={
          <>
            Your <span className="font-serif italic text-primary">customer</span> voices
          </>
        }
        description="Manage and organize every testimonial you've collected."
        action={
          <Link href="/dashboard/testimonials/import">
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </Link>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative overflow-hidden bg-white border border-primary/30 rounded-3xl p-6 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(255,89,94,0.20)]">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-primary/[0.08] blur-[40px] rounded-full pointer-events-none" />
          <div className="relative">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
              Total
            </div>
            <div className="text-4xl font-semibold tracking-tight text-foreground leading-none">
              {testimonialCount.toLocaleString()}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{publishedCount} published</div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)]">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
            Published
          </div>
          <div className="text-4xl font-semibold tracking-tight text-foreground leading-none">
            {publishedCount.toLocaleString()}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">live across widgets</div>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)]">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
            Avg rating
          </div>
          <div className="text-4xl font-semibold tracking-tight text-foreground leading-none">
            {avgRating.toFixed(1)}
          </div>
          <div className="mt-2 flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.round(avgRating) ? "text-primary fill-primary" : "text-border"
                }`}
                strokeWidth={0}
              />
            ))}
          </div>
        </div>
      </section>

      <TestimonialsClient testimonials={testimonials} />
    </div>
  );
}
