"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Plus,
  Edit,
  MoreVertical,
  Share2,
  Trash2,
  ExternalLink,
  Bookmark,
  Code2,
  Heart,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useUserPlan, isAtQuota } from "@/lib/use-user-plan";
import {
  useUpgradeDialog,
  handleQuotaResponse,
} from "@/lib/use-upgrade-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GridWidget } from "@/components/widgets/GridWidget";
import { CarouselWidget } from "@/components/widgets/CarouselWidget";
import { BadgeWidget } from "@/components/widgets/BadgeWidget";
import { MasonryWidget } from "@/components/widgets/MasonryWidget";
import { MarqueeWidget } from "@/components/widgets/MarqueeWidget";
import { ListWidget } from "@/components/widgets/ListWidget";
import { FeaturedWidget } from "@/components/widgets/FeaturedWidget";
import { SliderThumbnailsWidget } from "@/components/widgets/SliderThumbnailsWidget";
import Link from "next/link";

type WallOfLove = {
  id: string;
  name: string;
  slug: string;
  shareId: string | null;
  isActive: boolean;
  title: string | null;
  description: string | null;
  layout: string;
  views?: number;
  engagements?: number;
  createdAt: Date;
  updatedAt: Date;
};

type Widget = {
  id: string;
  name: string;
  template: string;
  shareId: string | null;
  isActive: boolean;
  views?: number;
  engagements?: number;
  createdAt: Date;
  updatedAt: Date;
};

type StudioClientProps = {
  walls: WallOfLove[];
  widgets: Widget[];
};

type Filter = "all" | "widgets" | "walls";

const mockTestimonials = [
  {
    id: "mock-1",
    content: "This product has completely transformed how we work!",
    rating: 5,
    authorName: "Sarah Johnson",
    authorTitle: "CEO",
    authorCompany: "TechCorp",
    authorImage: null,
    createdAt: new Date(),
  },
  {
    id: "mock-2",
    content: "Outstanding service and support. Highly recommend!",
    rating: 5,
    authorName: "Michael Chen",
    authorTitle: "Product Manager",
    authorCompany: "StartupXYZ",
    authorImage: null,
    createdAt: new Date(),
  },
  {
    id: "mock-3",
    content: "Best investment we've made this year.",
    rating: 4,
    authorName: "Emily Davis",
    authorTitle: "Director",
    authorCompany: "GlobalInc",
    authorImage: null,
    createdAt: new Date(),
  },
];

const defaultTheme = {
  primaryColor: "#ff595e",
  backgroundColor: "#ffffff",
  textColor: "#0a0a0a",
  starColor: "#ff595e",
};

const widgetTemplates = [
  { id: "grid", name: "Grid", template: "grid", hint: "Tidy rows + columns" },
  { id: "carousel", name: "Carousel", template: "carousel", hint: "One at a time, auto-rotate" },
  { id: "masonry", name: "Masonry", template: "masonry", hint: "Pinterest-style wall" },
  { id: "marquee", name: "Marquee", template: "marquee", hint: "Endless scrolling band" },
  { id: "list", name: "List", template: "list", hint: "Simple stacked quotes" },
  { id: "featured", name: "Featured", template: "featured", hint: "Hero quote spotlight" },
  { id: "badge", name: "Badge", template: "badge", hint: "Social-proof badge" },
  { id: "slider-thumbnails", name: "Slider", template: "slider-thumbnails", hint: "Slider with previews" },
];

const wallTemplates = [
  { id: "masonry", name: "Masonry", layout: "masonry", hint: "Mixed heights, full page" },
  { id: "grid", name: "Grid", layout: "grid", hint: "Uniform card grid" },
  { id: "list", name: "List", layout: "list", hint: "Long vertical stream" },
];

function templateLabel(item: { type: "wall" | "widget"; template?: string; layout?: string }) {
  if (item.type === "widget") {
    const t = widgetTemplates.find((w) => w.template === item.template);
    return t ? t.name : item.template ?? "Widget";
  }
  const t = wallTemplates.find((w) => w.layout === item.layout);
  return t ? t.name : item.layout ?? "Wall";
}

function relativeTime(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  const y = Math.floor(mo / 12);
  return `${y}y ago`;
}

const EYEBROW =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground";

export function StudioClient({ walls, widgets }: StudioClientProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<"wall" | "widget">("widget");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
  });

  const { data: planData, refresh: refreshPlan } = useUserPlan();
  const { showUpgrade } = useUpgradeDialog();

  const atWidgetQuota = isAtQuota(planData, "widgets");
  const atWallQuota = isAtQuota(planData, "walls");

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    try {
      const endpoint = createType === "wall" ? "/api/walls" : "/api/widgets";
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const payload: any = { ...formData, slug };
      if (createType === "widget") {
        payload.template = selectedTemplate || "grid";
      } else {
        payload.layout = selectedTemplate || "masonry";
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (await handleQuotaResponse(response, showUpgrade)) {
        setIsCreateDialogOpen(false);
        setFormData({ name: "", title: "", description: "" });
        setSelectedTemplate("");
        return;
      }

      if (!response.ok) throw new Error("Failed to create");

      toast.success(`${createType === "wall" ? "Wall" : "Widget"} created`);
      setIsCreateDialogOpen(false);
      setFormData({ name: "", title: "", description: "" });
      setSelectedTemplate("");
      await refreshPlan();
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const openCreateDialog = (type: "wall" | "widget", template?: string) => {
    // Gate before opening the create dialog — clicking a locked template tile
    // surfaces the upgrade paywall.
    if (type === "widget" && atWidgetQuota && planData) {
      showUpgrade({
        kind: "quota_reached",
        resource: "widget",
        current: planData.usage.widgets,
        limit: planData.limits.widgets,
      });
      return;
    }
    if (type === "wall" && atWallQuota && planData) {
      showUpgrade({
        kind: "quota_reached",
        resource: "wall",
        current: planData.usage.walls,
        limit: planData.limits.walls,
      });
      return;
    }
    setCreateType(type);
    setSelectedTemplate(template || "");
    setFormData({ name: "", title: "", description: "" });
    setIsCreateDialogOpen(true);
  };

  const getItemUrl = (item: WallOfLove | Widget, type: "wall" | "widget") => {
    if (!item.shareId) return "";
    if (typeof window === "undefined") return "";
    const path = type === "wall" ? "wall" : "widget";
    return `${window.location.origin}/${path}/${item.shareId}`;
  };

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard");
  };

  const deleteItem = async (id: string, type: "wall" | "widget", e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const endpoint = type === "wall" ? `/api/walls/${id}` : `/api/widgets/${id}`;
      const response = await fetch(endpoint, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Deleted");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const allItems = (() => {
    const wallItems = walls.map((w) => ({ ...w, type: "wall" as const }));
    const widgetItems = widgets.map((w) => ({ ...w, type: "widget" as const }));
    return [...wallItems, ...widgetItems].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  })();

  // "Saved" view shows everything; the other two pills are template pickers,
  // not filtered lists of saved items.
  const savedItems = allItems;

  const renderWidgetPreview = (template: string) => {
    switch (template) {
      case "grid":
        return <GridWidget testimonials={mockTestimonials} theme={defaultTheme} columns={2} />;
      case "carousel":
        return <CarouselWidget testimonials={mockTestimonials} theme={defaultTheme} autoRotate={false} />;
      case "badge":
        return <BadgeWidget testimonials={mockTestimonials} theme={defaultTheme} />;
      case "masonry":
        return <MasonryWidget testimonials={mockTestimonials} theme={defaultTheme} />;
      case "marquee":
        return <MarqueeWidget testimonials={mockTestimonials} theme={defaultTheme} />;
      case "list":
        return <ListWidget testimonials={mockTestimonials} theme={defaultTheme} />;
      case "featured":
        return <FeaturedWidget testimonials={mockTestimonials} theme={defaultTheme} />;
      case "slider-thumbnails":
        return <SliderThumbnailsWidget testimonials={mockTestimonials} theme={defaultTheme} />;
      default:
        return <GridWidget testimonials={mockTestimonials} theme={defaultTheme} columns={2} />;
    }
  };

  const renderWallPreview = (layout: string) => {
    const testimonialCard = (t: (typeof mockTestimonials)[0]) => (
      <div key={t.id} className="bg-background p-3 rounded-md border border-border break-inside-avoid mb-3">
        <div className="flex gap-0.5 mb-2">
          {[...Array(t.rating)].map((_, i) => (
            <span key={i} className="text-foreground text-xs">★</span>
          ))}
        </div>
        <p className="text-xs text-foreground mb-2 line-clamp-2">{t.content}</p>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground">
            {t.authorName[0]}
          </div>
          <div>
            <p className="text-xs font-semibold">{t.authorName}</p>
            <p className="text-[10px] text-muted-foreground">{t.authorTitle}</p>
          </div>
        </div>
      </div>
    );

    if (layout === "masonry") {
      return <div className="columns-2 gap-3">{mockTestimonials.map((t) => testimonialCard(t))}</div>;
    } else if (layout === "grid") {
      return <div className="grid grid-cols-2 gap-3">{mockTestimonials.map((t) => testimonialCard(t))}</div>;
    } else {
      return <div className="space-y-3">{mockTestimonials.map((t) => testimonialCard(t))}</div>;
    }
  };

  /* ——— Filter pills ——— */
  const pills: {
    id: Filter;
    label: string;
    icon: typeof Bookmark;
    iconBg: string;
    iconColor: string;
    count: number;
  }[] = [
    {
      id: "all",
      label: "Saved",
      icon: Bookmark,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      count: savedItems.length,
    },
    {
      id: "widgets",
      label: "Widgets",
      icon: Code2,
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
      count: widgetTemplates.length,
    },
    {
      id: "walls",
      label: "Walls of Love",
      icon: Heart,
      iconBg: "bg-primary-soft",
      iconColor: "text-primary",
      count: wallTemplates.length,
    },
  ];

  const TemplateTile = ({
    name,
    hint,
    onClick,
    preview,
  }: {
    name: string;
    hint: string;
    onClick: () => void;
    preview: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className="text-left bg-white border border-border rounded-xl overflow-hidden transition-all hover:border-neutral-400 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(15,15,15,0.04),0_12px_28px_-16px_rgba(15,15,15,0.12)] shadow-[0_1px_2px_rgba(15,15,15,0.03)] group"
    >
      <div className="relative bg-neutral-50 border-b border-border h-50 overflow-hidden">
        <div className="absolute inset-0 p-3">
          <div className="bg-white rounded-md h-full overflow-hidden">
            <div className="scale-[0.45] origin-top-left w-[222%] h-[222%]">
              {preview}
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-primary/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="px-3 py-1.5 rounded-full bg-white border border-border text-xs font-medium text-foreground shadow-sm flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Use template
          </div>
        </div>
      </div>
      <div className="px-3.5 py-3">
        <div className="font-semibold text-sm text-foreground">{name}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{hint}</div>
      </div>
    </button>
  );

  return (
    <div className="space-y-10">
      {/* ——— Hero panel ——— */}
      <section className="relative overflow-hidden bg-white border border-border rounded-3xl px-7 py-8 md:px-9 md:py-10 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)]">
        <div
          className="absolute inset-0 pointer-events-none opacity-70"
          style={{
            background:
              "radial-gradient(60% 80% at 100% 0%, rgba(255,89,94,0.05) 0%, transparent 70%)",
          }}
        />
        <div className="relative space-y-6">
          <div className="space-y-1.5 max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
              Studio
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-[1.1]">
              Social proof <span className="font-serif italic text-primary">studio</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              What would you like to create?
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {pills.map(({ id, label, icon: Icon, iconBg, iconColor, count }) => {
              const active = filter === id;
              return (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={`inline-flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                    active
                      ? "bg-white text-foreground border-black"
                      : "bg-white text-foreground border-border hover:border-neutral-400"
                  }`}
                >
                  <span
                    className={`h-6 w-6 rounded-md flex items-center justify-center ${iconBg}`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${iconColor}`} strokeWidth={2} />
                  </span>
                  <span>{label}</span>
                  <span
                    className="text-[11px] tabular-nums px-1.5 py-0.5 rounded-md bg-neutral-100 text-muted-foreground"
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ——— Saved view ——— */}
      {filter === "all" && (
      <section className="space-y-4">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <p className={EYEBROW}>Your saved</p>
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground mt-1">
              {savedItems.length === 0
                ? "Nothing saved yet"
                : `${savedItems.length} ${savedItems.length === 1 ? "item" : "items"}`}
            </h2>
          </div>
          {savedItems.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Most recently edited first
            </p>
          )}
        </div>

        {savedItems.length === 0 ? (
          <div className="bg-white border border-border rounded-2xl px-8 py-12 text-center shadow-[0_1px_2px_rgba(15,15,15,0.04),0_4px_12px_-6px_rgba(15,15,15,0.06)]">
            <div className="w-12 h-12 mx-auto mb-5 bg-neutral-100 border border-border rounded-xl flex items-center justify-center text-foreground/70">
              <Sparkles className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <p className="text-muted-foreground max-w-sm mx-auto mb-1">
              Nothing here yet.
            </p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Open the <span className="font-medium text-foreground">Widgets</span> or{" "}
              <span className="font-medium text-foreground">Walls of Love</span> tab above to pick a template and start.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedItems.map((item) => {
              const views = item.views || 0;
              const engagements = item.engagements || 0;
              const engagementRate =
                views > 0 ? ((engagements / views) * 100).toFixed(1) : "0.0";
              const editUrl =
                item.type === "wall"
                  ? `/dashboard/walls/${item.id}`
                  : `/dashboard/widgets/${item.id}`;
              const shareUrl = getItemUrl(item, item.type);
              const typeLabel = item.type === "wall" ? "Wall of Love" : "Widget";

              return (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={editUrl}
                  className="group relative block bg-white border border-border rounded-xl overflow-hidden transition-all hover:border-neutral-400 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(15,15,15,0.04),0_12px_28px_-16px_rgba(15,15,15,0.12)] shadow-[0_1px_2px_rgba(15,15,15,0.03)]"
                >
                  <div className="absolute top-3 right-3 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="w-8 h-8 rounded-full bg-white/95 backdrop-blur border border-border flex items-center justify-center transition-colors hover:bg-white"
                          aria-label="More actions"
                        >
                          <MoreVertical className="h-4 w-4 text-foreground" strokeWidth={1.75} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(editUrl);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {shareUrl && (
                          <>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(shareUrl, "_blank");
                              }}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View live
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => copyToClipboard(shareUrl, e)}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Copy link
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => deleteItem(item.id, item.type, e)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="relative bg-neutral-50 border-b border-border h-44 overflow-hidden">
                    <div className="absolute inset-0 p-4">
                      <div className="bg-white rounded-md h-full overflow-hidden">
                        <div className="scale-[0.5] origin-top-left w-[200%] h-[200%]">
                          {item.type === "widget"
                            ? renderWidgetPreview(item.template)
                            : renderWallPreview(item.layout)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1 gap-3">
                      <h3 className="font-semibold text-base text-foreground truncate flex-1">
                        {item.name}
                      </h3>
                     
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span> {typeLabel}</span>
                      <span className="text-border">·</span>
                      <Clock className="h-3 w-3" strokeWidth={1.75} />
                      <span>Edited {relativeTime(item.updatedAt)}</span>
                    </div>

                    <div className=" pt-3  border-border grid grid-cols-3 gap-2">
                      <div className="bg-muted rounded-md p-2 text-center border border-border">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Views</div>
                        <div className="text-sm font-semibold tabular-nums text-foreground">
                          {views.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-muted rounded-md p-2 text-center border border-border">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Clicks</div>
                        <div className="text-sm font-semibold tabular-nums text-foreground">
                          {engagements.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-muted rounded-md p-2 text-center border border-border">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Rate</div>
                        <div className="text-sm font-semibold tabular-nums text-foreground">
                          {engagementRate}%
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
      )}

      {/* ——— Widgets template picker ——— */}
      {filter === "widgets" && (
        <section className="space-y-4">
          <div>
            <p className={EYEBROW}>Widgets</p>
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground mt-1">
              Pick a template to start
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Each widget embeds on any site with a single line of code.
            </p>
          </div>
          {atWidgetQuota && (
            <QuotaLockBanner
              resource="widget"
              onUpgrade={() =>
                planData &&
                showUpgrade({
                  kind: "quota_reached",
                  resource: "widget",
                  current: planData.usage.widgets,
                  limit: planData.limits.widgets,
                })
              }
            />
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {widgetTemplates.map((t) => (
              <TemplateTile
                key={t.id}
                name={t.name}
                hint={t.hint}
                onClick={() => openCreateDialog("widget", t.template)}
                preview={renderWidgetPreview(t.template)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ——— Walls of Love template picker ——— */}
      {filter === "walls" && (
        <section className="space-y-4">
          <div>
            <p className={EYEBROW}>Walls of Love</p>
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground mt-1">
              Pick a template to start
            </h2>

          </div>
          {atWallQuota && (
            <QuotaLockBanner
              resource="wall"
              onUpgrade={() =>
                planData &&
                showUpgrade({
                  kind: "quota_reached",
                  resource: "wall",
                  current: planData.usage.walls,
                  limit: planData.limits.walls,
                })
              }
            />
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {wallTemplates.map((t) => (
              <TemplateTile
                key={t.id}
                name={t.name}
                hint={t.hint}
                onClick={() => openCreateDialog("wall", t.layout)}
                preview={renderWallPreview(t.layout)}
              />
            ))}
          </div>
        </section>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create {createType === "wall" ? "Wall of Love" : "Widget"}
            </DialogTitle>
            <DialogDescription>
              {createType === "wall"
                ? "Create a beautiful page to showcase all your testimonials."
                : "Create an embeddable widget for your website."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Main Wall, Homepage Widget"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder={createType === "wall" ? "Wall of Love" : "What our customers say"}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder={
                  createType === "wall"
                    ? "See what our customers are saying"
                    : "Don't just take our word for it"
                }
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QuotaLockBanner({
  resource,
  onUpgrade,
}: {
  resource: "widget" | "wall";
  onUpgrade: () => void;
}) {
  const noun = resource === "widget" ? "widget" : "Wall of Love";
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50">
      <div className="flex items-start gap-3">
        <span className="h-7 w-7 rounded-md bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="h-4 w-4 text-amber-700" strokeWidth={2} />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            You already have a {noun} on the Free tier
          </p>
          <p className="text-[13px] text-muted-foreground leading-snug">
            Free is capped at 1 {noun} per workspace. Upgrade to Pro for unlimited.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onUpgrade}
        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
      >
        Upgrade
      </button>
    </div>
  );
}
