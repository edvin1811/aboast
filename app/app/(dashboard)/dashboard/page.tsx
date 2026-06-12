import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentWorkspace } from "@/lib/workspace";
import { MessageSquare, Palette, FileText, ArrowUpRight } from "lucide-react";
import { PageBanner } from "../components/PageBanner";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) return null;

  let testimonialCount = 0;
  let widgetCount = 0;
  let formCount = 0;
  let publishedCount = 0;

  if (process.env.DATABASE_URL) {
    try {
      let dbUser = await db.user.findUnique({ where: { clerkId: user.id } });
      if (!dbUser) {
        dbUser = await db.user.create({
          data: {
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress || "",
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
          },
        });
      }
      const workspace = await getCurrentWorkspace(dbUser.id);
      const [testimonials, widgets, forms] = await Promise.all([
        db.testimonial.findMany({ where: { workspaceId: workspace.id } }),
        db.widget.findMany({ where: { workspaceId: workspace.id } }),
        db.form.findMany({ where: { workspaceId: workspace.id } }),
      ]);
      testimonialCount = testimonials.length;
      widgetCount = widgets.length;
      formCount = forms.length;
      publishedCount = testimonials.filter((t) => t.isPublished).length;
    } catch (error) {
      console.error("Database error:", error);
    }
  }

  const stats = [
    {
      label: "Testimonials",
      value: testimonialCount,
      sub: `${publishedCount} published`,
      featured: true,
    },
    { label: "Published", value: publishedCount, sub: "live across widgets" },
    { label: "Widgets", value: widgetCount, sub: "embeddable" },
    { label: "Forms", value: formCount, sub: "collecting" },
  ];

  const actions = [
    {
      href: "/dashboard/testimonials/new",
      icon: MessageSquare,
      title: "Add testimonial",
      sub: "Manually add a new entry",
    },
    {
      href: "/dashboard/studio",
      icon: Palette,
      title: "Create widget",
      sub: "Pick a template and start",
    },
    {
      href: "/dashboard/forms",
      icon: FileText,
      title: "Create form",
      sub: "Set up a collection form",
    },
  ];

  return (
    <div className="space-y-12">
      <PageBanner
        eyebrow="Overview"
        title={
          <>
            Your{" "}
            <span className="font-serif italic text-primary">testimonials</span>{" "}
            at a glance.
          </>
        }
        description="Snapshot of what you've collected, published, and shared."
      />

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const featured = stat.featured;
          return (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-2xl border border-border bg-white p-6 transition-all shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)]"
            >
              {featured && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider text-primary bg-primary-soft border border-primary/15">
                  Live
                </div>
              )}
              <div className="relative">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
                  {stat.label}
                </div>
                <div className="text-4xl font-semibold tracking-tight text-foreground leading-none">
                  {stat.value.toLocaleString()}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{stat.sub}</div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Quick actions</h2>
          <p className="text-sm text-muted-foreground">Get started by creating your first content</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map(({ href, icon: Icon, title, sub }) => (
            <Link
              key={href}
              href={href}
              className="group relative overflow-hidden bg-white border border-border rounded-2xl p-6 transition-all hover:border-neutral-300 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)]"
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-primary/[0.05] blur-[50px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-start justify-between mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-soft border border-primary/20 flex items-center justify-center text-primary transition-colors">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.75} />
              </div>
              <div className="relative">
                <div className="font-semibold text-foreground mb-1 tracking-tight">{title}</div>
                <div className="text-sm text-muted-foreground">{sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
