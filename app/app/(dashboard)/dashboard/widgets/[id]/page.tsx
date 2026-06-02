"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Save, Trash2, Star, Code, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { GridWidget } from "@/components/widgets/GridWidget";
import { CarouselWidget } from "@/components/widgets/CarouselWidget";
import { BadgeWidget } from "@/components/widgets/BadgeWidget";
import { MasonryWidget } from "@/components/widgets/MasonryWidget";
import { MarqueeWidget } from "@/components/widgets/MarqueeWidget";
import { ListWidget } from "@/components/widgets/ListWidget";
import { FeaturedWidget } from "@/components/widgets/FeaturedWidget";
import { SliderThumbnailsWidget } from "@/components/widgets/SliderThumbnailsWidget";

interface Testimonial {
  id: string;
  content: string;
  rating: number;
  authorName: string;
  authorTitle: string | null;
  authorCompany: string | null;
  authorImage?: string | null;
  isPublished: boolean;
}

interface WidgetTestimonial {
  testimonialId: string;
  order: number;
  testimonial: Testimonial;
}

interface Widget {
  id: string;
  name: string;
  slug: string;
  template: string;
  isActive: boolean;
  autoRotate: boolean;
  rotateInterval: number | null;
  theme: any;
  layout: any;
  widgetTestimonials: WidgetTestimonial[];
}

export default function WidgetEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [widget, setWidget] = useState<Widget | null>(null);
  const [allTestimonials, setAllTestimonials] = useState<Testimonial[]>([]);
  const [id, setId] = useState<string>("");

  // Form state
  const [name, setName] = useState("");
  const [template, setTemplate] = useState("grid");
  const [isActive, setIsActive] = useState(true);
  const [selectedTestimonials, setSelectedTestimonials] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);

  // Theme state
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#1f2937");
  const [starColor, setStarColor] = useState("#fbbf24");

  // Layout state
  const [columns, setColumns] = useState(3);
  const [autoRotate, setAutoRotate] = useState(false);
  const [rotateInterval, setRotateInterval] = useState(5000);

  // Section collapse state
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [themeOpen, setThemeOpen] = useState(true);
  const [layoutOpen, setLayoutOpen] = useState(true);
  const [testimonialsOpen, setTestimonialsOpen] = useState(true);

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      fetchData(p.id);
    });
  }, []);

  const fetchData = async (widgetId: string) => {
    try {
      const [widgetRes, testimonialsRes] = await Promise.all([
        fetch(`/api/widgets/${widgetId}`),
        fetch("/api/testimonials"),
      ]);

      if (widgetRes.ok) {
        const widgetData = await widgetRes.json();
        setWidget(widgetData);
        setName(widgetData.name);
        setTemplate(widgetData.template);
        setIsActive(widgetData.isActive);

        // Set theme
        const theme = widgetData.theme || {};
        setPrimaryColor(theme.primaryColor || "#6366f1");
        setBackgroundColor(theme.backgroundColor || "#ffffff");
        setTextColor(theme.textColor || "#1f2937");
        setStarColor(theme.starColor || "#fbbf24");

        // Set layout
        const layout = widgetData.layout || {};
        setColumns(layout.columns || 3);
        setAutoRotate(widgetData.autoRotate || false);
        setRotateInterval(widgetData.rotateInterval || 5000);

        // Set selected testimonials
        const selected = widgetData.widgetTestimonials.map(
          (wt: WidgetTestimonial) => wt.testimonialId
        );
        setSelectedTestimonials(selected);
      } else {
        router.push("/dashboard/studio");
      }

      if (testimonialsRes.ok) {
        const testimonialsData = await testimonialsRes.json();
        setAllTestimonials(testimonialsData.filter((t: Testimonial) => t.isPublished));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      router.push("/dashboard/studio");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/widgets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          template,
          isActive,
          theme: {
            primaryColor,
            backgroundColor,
            textColor,
            starColor,
          },
          layout: {
            columns,
          },
          autoRotate,
          rotateInterval: autoRotate ? rotateInterval : null,
          testimonialIds: selectedTestimonials,
        }),
      });

      if (response.ok) {
        router.push("/dashboard/studio");
        router.refresh();
      } else {
        alert("Failed to save widget");
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/widgets/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/dashboard/studio");
        router.refresh();
      } else {
        alert("Failed to delete widget");
        setDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("An error occurred");
      setDeleting(false);
    }
  };

  const toggleTestimonial = (testimonialId: string) => {
    setSelectedTestimonials((prev) =>
      prev.includes(testimonialId)
        ? prev.filter((id) => id !== testimonialId)
        : [...prev, testimonialId]
    );
  };

  const getEmbedCode = () => {
    if (!widget) return "";
    const baseUrl = window.location.origin;
    return `<iframe src="${baseUrl}/widget/${widget.slug}" width="100%" height="600" frameborder="0"></iframe>`;
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="w-80 bg-card border-r border-border p-6">
          <div className="h-6 w-32 bg-muted animate-pulse rounded mb-6" />
          <div className="space-y-4">
            <div className="h-10 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="flex-1 bg-neutral-50 p-8">
          <div className="h-64 bg-card animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!widget) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <Link
              href="/dashboard/studio"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Studio
            </Link>
            <div className="space-y-3">
              <Label htmlFor="widgetName" className="text-xs text-muted-foreground">
                Widget Name
              </Label>
              <Input
                id="widgetName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="font-semibold"
                placeholder="Widget Name"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
                  {isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="border-b border-border">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <span className="font-semibold text-sm">Settings</span>
              {settingsOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {settingsOpen && (
              <div className="px-6 pb-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template" className="text-xs">
                    Template
                  </Label>
                  <select
                    id="template"
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="grid">Grid Layout</option>
                    <option value="carousel">Carousel Slider</option>
                    <option value="badge">Social Proof Badge</option>
                    <option value="masonry">Wall of Love</option>
                    <option value="marquee">Scrolling Marquee</option>
                    <option value="list">Simple List</option>
                    <option value="featured">Featured Testimonial</option>
                    <option value="slider-thumbnails">Slider with Previews</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="active" className="text-xs">
                    Active
                  </Label>
                  <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </div>
            )}
          </div>

          {/* Theme Section */}
          <div className="border-b border-border">
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <span className="font-semibold text-sm">Theme</span>
              {themeOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {themeOpen && (
              <div className="px-6 pb-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor" className="text-xs">
                    Primary Color
                  </Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="primaryColor"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-9 w-12 rounded border border-input cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backgroundColor" className="text-xs">
                    Background
                  </Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="backgroundColor"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="h-9 w-12 rounded border border-input cursor-pointer"
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textColor" className="text-xs">
                    Text Color
                  </Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="textColor"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="h-9 w-12 rounded border border-input cursor-pointer"
                    />
                    <Input
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="starColor" className="text-xs">
                    Star Color
                  </Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="starColor"
                      value={starColor}
                      onChange={(e) => setStarColor(e.target.value)}
                      className="h-9 w-12 rounded border border-input cursor-pointer"
                    />
                    <Input
                      value={starColor}
                      onChange={(e) => setStarColor(e.target.value)}
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Layout Section */}
          <div className="border-b border-border">
            <button
              onClick={() => setLayoutOpen(!layoutOpen)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <span className="font-semibold text-sm">Layout</span>
              {layoutOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {layoutOpen && (
              <div className="px-6 pb-4 space-y-4">
                {template === "grid" && (
                  <div className="space-y-2">
                    <Label htmlFor="columns" className="text-xs">
                      Columns: {columns}
                    </Label>
                    <input
                      type="range"
                      id="columns"
                      min="1"
                      max="4"
                      value={columns}
                      onChange={(e) => setColumns(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                    </div>
                  </div>
                )}

                {template === "carousel" && (
                  <>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoRotate" className="text-xs">
                        Auto-rotate
                      </Label>
                      <Switch
                        id="autoRotate"
                        checked={autoRotate}
                        onCheckedChange={setAutoRotate}
                      />
                    </div>

                    {autoRotate && (
                      <div className="space-y-2">
                        <Label htmlFor="rotateInterval" className="text-xs">
                          Interval: {rotateInterval / 1000}s
                        </Label>
                        <input
                          type="range"
                          id="rotateInterval"
                          min="2000"
                          max="10000"
                          step="1000"
                          value={rotateInterval}
                          onChange={(e) => setRotateInterval(Number(e.target.value))}
                          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>2s</span>
                          <span>6s</span>
                          <span>10s</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Testimonials Section */}
          <div className="border-b border-border">
            <button
              onClick={() => setTestimonialsOpen(!testimonialsOpen)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <span className="font-semibold text-sm">
                Testimonials ({selectedTestimonials.length})
              </span>
              {testimonialsOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {testimonialsOpen && (
              <div className="px-6 pb-4">
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {allTestimonials.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-xs">
                      No published testimonials
                    </div>
                  ) : (
                    allTestimonials.map((testimonial) => (
                      <div
                        key={testimonial.id}
                        className="flex items-start gap-2 p-2 border border-border rounded hover:border-primary transition cursor-pointer"
                        onClick={() => toggleTestimonial(testimonial.id)}
                      >
                        <Checkbox
                          checked={selectedTestimonials.includes(testimonial.id)}
                          onCheckedChange={() => toggleTestimonial(testimonial.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs text-foreground mb-0.5">
                            {testimonial.authorName}
                          </div>
                          <div className="flex gap-0.5 mb-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-2.5 w-2.5 ${
                                  i < testimonial.rating
                                    ? "text-primary fill-primary"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {testimonial.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-6 border-t border-border space-y-3 bg-card">
          <Button onClick={handleSave} disabled={saving || !name} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEmbedDialog(true)}
              className="flex-1 text-xs"
            >
              <Code className="h-3 w-3 mr-1" />
              Get Code
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="flex-1 text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Right Preview Panel */}
      <div className="flex-1 bg-neutral-50 overflow-y-auto">
        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">Live Preview</h2>
            <p className="text-sm text-muted-foreground">
              See your changes in real-time
            </p>
          </div>
          <div className="bg-card rounded-lg border border-border p-8">
            {(() => {
              const previewTestimonials = allTestimonials
                .filter((t) => selectedTestimonials.includes(t.id))
                .map((t) => ({
                  ...t,
                  authorImage: t.authorImage || null,
                  isPublished: true,
                  createdAt: new Date(),
                }));

              if (previewTestimonials.length === 0) {
                return (
                  <div className="text-center py-16 text-muted-foreground">
                    <p>Select testimonials to see preview</p>
                  </div>
                );
              }

              const themeProps = {
                primaryColor,
                backgroundColor,
                textColor,
                starColor,
              };

              switch (template) {
                case "grid":
                  return (
                    <GridWidget
                      testimonials={previewTestimonials}
                      theme={themeProps}
                      columns={columns}
                    />
                  );
                case "carousel":
                  return (
                    <CarouselWidget
                      testimonials={previewTestimonials}
                      theme={themeProps}
                      autoRotate={autoRotate}
                      rotateInterval={rotateInterval}
                    />
                  );
                case "badge":
                  return (
                    <BadgeWidget
                      testimonials={previewTestimonials}
                      theme={themeProps}
                    />
                  );
                case "masonry":
                  return (
                    <MasonryWidget
                      testimonials={previewTestimonials}
                      theme={themeProps}
                    />
                  );
                case "marquee":
                  return (
                    <MarqueeWidget
                      testimonials={previewTestimonials}
                      theme={themeProps}
                    />
                  );
                case "list":
                  return (
                    <ListWidget
                      testimonials={previewTestimonials}
                      theme={themeProps}
                    />
                  );
                case "featured":
                  return (
                    <FeaturedWidget
                      testimonials={previewTestimonials}
                      theme={themeProps}
                    />
                  );
                case "slider-thumbnails":
                  return (
                    <SliderThumbnailsWidget
                      testimonials={previewTestimonials}
                      theme={themeProps}
                    />
                  );
                default:
                  return (
                    <GridWidget
                      testimonials={previewTestimonials}
                      theme={themeProps}
                      columns={columns}
                    />
                  );
              }
            })()}
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Widget</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this widget? This action cannot be undone
              and will break any embedded instances.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete Widget"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Embed Code Dialog */}
      <Dialog open={showEmbedDialog} onOpenChange={setShowEmbedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Embed Code</DialogTitle>
            <DialogDescription>
              Copy this code and paste it into your website where you want the widget to
              appear
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
              {getEmbedCode()}
            </div>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(getEmbedCode());
                alert("Copied to clipboard!");
              }}
              className="w-full"
            >
              Copy to Clipboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
