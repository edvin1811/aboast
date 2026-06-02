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
  Palette,
  Plus,
  Edit,
  Eye,
  MousePointerClick,
  MoreVertical,
  Share2,
  Trash2,
  ExternalLink,
  Bookmark,
} from "lucide-react";
import { toast } from "sonner";
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
import { PageBanner } from "../../components/PageBanner";

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

type ContentType = "saved" | "walls" | "widgets";

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

const wallTemplates = [
  { id: "masonry", name: "Masonry", layout: "masonry" },
  { id: "grid", name: "Grid", layout: "grid" },
  { id: "list", name: "List", layout: "list" },
];

const widgetTemplates = [
  { id: "grid", name: "Grid", template: "grid" },
  { id: "carousel", name: "Carousel", template: "carousel" },
  { id: "masonry", name: "Masonry", template: "masonry" },
  { id: "marquee", name: "Marquee", template: "marquee" },
  { id: "list", name: "List", template: "list" },
  { id: "featured", name: "Featured", template: "featured" },
  { id: "badge", name: "Badge", template: "badge" },
  { id: "slider-thumbnails", name: "Slider", template: "slider-thumbnails" },
];

export function StudioClient({ walls, widgets }: StudioClientProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<ContentType>("saved");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<"wall" | "widget">("wall");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
  });

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

      if (!response.ok) throw new Error("Failed to create");

      toast.success(`${createType === "wall" ? "Wall" : "Widget"} created successfully`);
      setIsCreateDialogOpen(false);
      setFormData({ name: "", title: "", description: "" });
      setSelectedTemplate("");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const openCreateDialog = (type: "wall" | "widget", template?: string) => {
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

      toast.success("Deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const savedItems = (() => {
    const wallItems = walls.map(w => ({ ...w, type: "wall" as const }));
    const widgetItems = widgets.map(w => ({ ...w, type: "widget" as const }));
    return [...wallItems, ...widgetItems].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  })();

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
    const testimonialCard = (t: typeof mockTestimonials[0]) => (
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
      return <div className="columns-2 gap-3">{mockTestimonials.map(t => testimonialCard(t))}</div>;
    } else if (layout === "grid") {
      return <div className="grid grid-cols-2 gap-3">{mockTestimonials.map(t => testimonialCard(t))}</div>;
    } else {
      return <div className="space-y-3">{mockTestimonials.map(t => testimonialCard(t))}</div>;
    }
  };

  const tabs: { id: ContentType; label: string; icon: typeof Bookmark }[] = [
    { id: "saved", label: "Saved", icon: Bookmark },
    { id: "widgets", label: "Widgets", icon: Palette },
    { id: "walls", label: "Walls of Love", icon: Sparkles },
  ];

  return (
    <div className="space-y-12">
      <PageBanner
        eyebrow="Share"
        title={
          <>
            <span className="font-serif italic text-primary">Studio</span> for social proof
          </>
        }
        description="Pick a template, give it a name, ship it. Walls and widgets in one place."
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative overflow-hidden bg-white border border-primary/30 rounded-3xl p-6 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(255,89,94,0.20)]">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-primary/[0.08] blur-[40px] rounded-full pointer-events-none" />
          <div className="relative">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
              Saved
            </div>
            <div className="text-4xl font-semibold tracking-tight text-foreground leading-none">
              {savedItems.length}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">walls + widgets combined</div>
          </div>
        </div>
        <div className="bg-white border border-border rounded-3xl p-6 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)]">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
            Widgets
          </div>
          <div className="text-4xl font-semibold tracking-tight text-foreground leading-none">
            {widgets.length}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">embeddable on any site</div>
        </div>
        <div className="bg-white border border-border rounded-3xl p-6 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)]">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
            Walls of love
          </div>
          <div className="text-4xl font-semibold tracking-tight text-foreground leading-none">
            {walls.length}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">shareable pages</div>
        </div>
      </section>

      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = selectedType === id;
          return (
            <button
              key={id}
              onClick={() => setSelectedType(id)}
              className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm transition-colors ${
                active
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {active && (
                <span className="absolute left-0 right-0 bottom-[-1px] h-[2px] bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {selectedType === "saved" && (
        <div>
          {savedItems.length === 0 ? (
            <div className="bg-white border border-border rounded-3xl p-16 text-center shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)]">
              <div className="w-14 h-14 mx-auto mb-6 bg-primary-soft border border-primary/30 rounded-2xl flex items-center justify-center text-primary">
                <Sparkles className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-foreground mb-2">
                Start creating
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first Wall of Love or Widget to showcase your testimonials.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setSelectedType("walls")}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create wall
                </Button>
                <Button onClick={() => setSelectedType("widgets")} variant="outline">
                  <Palette className="h-4 w-4 mr-2" />
                  Create widget
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                return (
                  <div key={`${item.type}-${item.id}`} className="relative">
                    <Link href={editUrl}>
                      <div className="bg-background border border-border rounded-xl overflow-hidden transition-all hover:border-primary hover:-translate-y-0.5 cursor-pointer group relative">
                        <div className="absolute top-3 right-3 z-10">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center transition-colors hover:bg-muted"
                              >
                                <MoreVertical className="h-4 w-4 text-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = editUrl;
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

                        <div className="bg-muted p-4 relative border-b border-border">
                          <div className="bg-background rounded-md p-4 overflow-hidden">
                            <div className="scale-[0.6] origin-top-left w-[166%] h-48 overflow-hidden">
                              {item.type === "widget"
                                ? renderWidgetPreview(item.template)
                                : renderWallPreview(item.layout)}
                            </div>
                          </div>

                          <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                              <Edit className="h-5 w-5 text-foreground" />
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex items-center justify-between mb-4 gap-3">
                            <h3 className="font-semibold text-base text-foreground truncate flex-1">
                              {item.name}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold uppercase tracking-[0.2px] ${
                                item.isActive
                                  ? "bg-foreground text-background"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {item.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-border">
                            <div>
                              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                <Eye className="h-3 w-3" />
                                <span className="text-[10px] uppercase tracking-[0.2px]">Views</span>
                              </div>
                              <p className="text-sm font-semibold text-foreground">
                                {views.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                <MousePointerClick className="h-3 w-3" />
                                <span className="text-[10px] uppercase tracking-[0.2px]">Clicks</span>
                              </div>
                              <p className="text-sm font-semibold text-foreground">
                                {engagements.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <div className="text-muted-foreground mb-1">
                                <span className="text-[10px] uppercase tracking-[0.2px]">Rate</span>
                              </div>
                              <p className="text-sm font-semibold text-foreground">
                                {engagementRate}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {selectedType === "widgets" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgetTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => openCreateDialog("widget", template.template)}
              className="text-left bg-background border border-border rounded-xl overflow-hidden transition-all hover:border-primary hover:-translate-y-0.5 group"
            >
              <div className="bg-muted p-3 relative border-b border-border">
                <div className="bg-background rounded-md p-3 overflow-hidden">
                  <div className="scale-[0.5] origin-top-left w-[200%] h-40 overflow-hidden">
                    {renderWidgetPreview(template.template)}
                  </div>
                </div>

                <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                    <Plus className="h-5 w-5 text-foreground" />
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-base text-foreground">{template.name}</h3>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedType === "walls" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => openCreateDialog("wall", template.layout)}
              className="text-left bg-background border border-border rounded-xl overflow-hidden transition-all hover:border-primary hover:-translate-y-0.5 group"
            >
              <div className="bg-muted p-3 relative border-b border-border">
                <div className="bg-background rounded-md p-3 overflow-hidden">
                  <div className="scale-[0.6] origin-top-left w-[166%] h-40 overflow-hidden">
                    {renderWallPreview(template.layout)}
                  </div>
                </div>

                <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                    <Plus className="h-5 w-5 text-foreground" />
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-base text-foreground">{template.name}</h3>
              </div>
            </button>
          ))}
        </div>
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
