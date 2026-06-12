"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Star, Code2, Lock, Sparkles as SparklesIcon } from "lucide-react";
import { useUserPlan } from "@/lib/use-user-plan";
import { useUpgradeDialog } from "@/lib/use-upgrade-dialog";
import { GridWidget } from "@/components/widgets/GridWidget";
import { CarouselWidget } from "@/components/widgets/CarouselWidget";
import { BadgeWidget } from "@/components/widgets/BadgeWidget";
import { MasonryWidget } from "@/components/widgets/MasonryWidget";
import { MarqueeWidget } from "@/components/widgets/MarqueeWidget";
import { ListWidget } from "@/components/widgets/ListWidget";
import { FeaturedWidget } from "@/components/widgets/FeaturedWidget";
import { SliderThumbnailsWidget } from "@/components/widgets/SliderThumbnailsWidget";
import { EmbedDialog } from "@/components/EmbedDialog";

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
  shareId: string | null;
  template: string;
  isActive: boolean;
  autoRotate: boolean;
  rotateInterval: number | null;
  theme: any;
  layout: any;
  widgetTestimonials: WidgetTestimonial[];
}

const TEMPLATES = [
  { value: "grid", label: "Grid Layout" },
  { value: "carousel", label: "Carousel Slider" },
  { value: "badge", label: "Social Proof Badge" },
  { value: "masonry", label: "Wall of Love" },
  { value: "marquee", label: "Scrolling Marquee" },
  { value: "list", label: "Simple List" },
  { value: "featured", label: "Featured Testimonial" },
  { value: "slider-thumbnails", label: "Slider with Previews" },
];

const EYEBROW =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3";

function ColorRow({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 rounded-md border border-input cursor-pointer p-0.5"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-xs font-mono"
        />
      </div>
    </div>
  );
}

export default function WidgetEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [widget, setWidget] = useState<Widget | null>(null);
  const [allTestimonials, setAllTestimonials] = useState<Testimonial[]>([]);
  const [id, setId] = useState<string>("");

  const [name, setName] = useState("");
  const [template, setTemplate] = useState("grid");
  const [isActive, setIsActive] = useState(true);
  const [selectedTestimonials, setSelectedTestimonials] = useState<string[]>([]);
  const [embedOpen, setEmbedOpen] = useState(false);

  // Theme
  const [primaryColor, setPrimaryColor] = useState("#ff595e");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#0a0a0a");
  const [starColor, setStarColor] = useState("#ff595e");

  // Layout
  const [columns, setColumns] = useState(3);
  const [autoRotate, setAutoRotate] = useState(false);
  const [rotateInterval, setRotateInterval] = useState(5000);

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

        const theme = widgetData.theme || {};
        setPrimaryColor(theme.primaryColor || "#ff595e");
        setBackgroundColor(theme.backgroundColor || "#ffffff");
        setTextColor(theme.textColor || "#0a0a0a");
        setStarColor(theme.starColor || "#ff595e");

        const layout = widgetData.layout || {};
        setColumns(layout.columns || 3);
        setAutoRotate(widgetData.autoRotate || false);
        setRotateInterval(widgetData.rotateInterval || 5000);

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
          theme: { primaryColor, backgroundColor, textColor, starColor },
          layout: { columns },
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

  const toggleTestimonial = (testimonialId: string) => {
    setSelectedTestimonials((prev) =>
      prev.includes(testimonialId)
        ? prev.filter((tid) => tid !== testimonialId)
        : [...prev, testimonialId]
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="w-[336px] bg-card border-r border-border p-6">
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

  if (!widget) return null;

  const previewTestimonials = allTestimonials
    .filter((t) => selectedTestimonials.includes(t.id))
    .map((t) => ({
      ...t,
      authorImage: t.authorImage || null,
      isPublished: true,
      createdAt: new Date(),
    }));
  const themeProps = { primaryColor, backgroundColor, textColor, starColor };

  const renderPreview = () => {
    if (previewTestimonials.length === 0) {
      return (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Select testimonials in the Testimonials tab to see the preview.
        </div>
      );
    }
    switch (template) {
      case "grid":
        return <GridWidget testimonials={previewTestimonials} theme={themeProps} columns={columns} />;
      case "carousel":
        return <CarouselWidget testimonials={previewTestimonials} theme={themeProps} autoRotate={autoRotate} rotateInterval={rotateInterval} />;
      case "badge":
        return <BadgeWidget testimonials={previewTestimonials} theme={themeProps} />;
      case "masonry":
        return <MasonryWidget testimonials={previewTestimonials} theme={themeProps} />;
      case "marquee":
        return <MarqueeWidget testimonials={previewTestimonials} theme={themeProps} />;
      case "list":
        return <ListWidget testimonials={previewTestimonials} theme={themeProps} />;
      case "featured":
        return <FeaturedWidget testimonials={previewTestimonials} theme={themeProps} />;
      case "slider-thumbnails":
        return <SliderThumbnailsWidget testimonials={previewTestimonials} theme={themeProps} />;
      default:
        return <GridWidget testimonials={previewTestimonials} theme={themeProps} columns={columns} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left editor panel */}
      <div className="w-[336px] bg-card border-r border-border flex flex-col">
        <div className="px-5 pt-5 pb-3">
          <Link
            href="/dashboard/studio"
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Studio
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-foreground text-base truncate flex-1">
              {name || "Untitled widget"}
            </h1>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-neutral-100 text-muted-foreground border border-border"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <Tabs defaultValue="basic" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-5 mt-4 grid grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="testimonials">Quotes</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            {/* BASIC */}
            <TabsContent value="basic" className="space-y-5 mt-0">
              <div>
                <p className={EYEBROW}>Identity</p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="widgetName" className="text-xs">
                      Widget name
                    </Label>
                    <Input
                      id="widgetName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Pricing page wall"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="template" className="text-xs">
                      Template
                    </Label>
                    <select
                      id="template"
                      value={template}
                      onChange={(e) => setTemplate(e.target.value)}
                      className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      {TEMPLATES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <p className={EYEBROW}>Visibility</p>
                <div className="flex items-center justify-between bg-neutral-50 border border-border rounded-lg px-3 py-2.5">
                  <div>
                    <Label htmlFor="active" className="text-xs font-medium">
                      Widget is active
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Live on every site that embeds it.
                    </p>
                  </div>
                  <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </div>
            </TabsContent>

            {/* STYLE */}
            <TabsContent value="style" className="space-y-5 mt-0">
              <p className={EYEBROW}>Colors</p>
              <div className="space-y-3">
                <ColorRow id="primaryColor" label="Primary" value={primaryColor} onChange={setPrimaryColor} />
                <ColorRow id="backgroundColor" label="Background" value={backgroundColor} onChange={setBackgroundColor} />
                <ColorRow id="textColor" label="Text" value={textColor} onChange={setTextColor} />
                <ColorRow id="starColor" label="Stars" value={starColor} onChange={setStarColor} />
              </div>

              <div>
                <p className={EYEBROW}>Branding</p>
                <BrandingToggle />
              </div>
            </TabsContent>

            {/* LAYOUT */}
            <TabsContent value="layout" className="space-y-5 mt-0">
              {template === "grid" && (
                <div>
                  <p className={EYEBROW}>Grid columns</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="columns" className="text-xs">
                        Columns
                      </Label>
                      <span className="text-sm font-semibold text-foreground tabular-nums">
                        {columns}
                      </span>
                    </div>
                    <input
                      type="range"
                      id="columns"
                      min="1"
                      max="4"
                      value={columns}
                      onChange={(e) => setColumns(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                    </div>
                  </div>
                </div>
              )}

              {template === "carousel" && (
                <div>
                  <p className={EYEBROW}>Carousel motion</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-neutral-50 border border-border rounded-lg px-3 py-2.5">
                      <div>
                        <Label htmlFor="autoRotate" className="text-xs font-medium">
                          Auto-rotate
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          Cycle through testimonials automatically.
                        </p>
                      </div>
                      <Switch
                        id="autoRotate"
                        checked={autoRotate}
                        onCheckedChange={setAutoRotate}
                      />
                    </div>

                    {autoRotate && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="rotateInterval" className="text-xs">
                            Interval
                          </Label>
                          <span className="text-sm font-semibold text-foreground tabular-nums">
                            {rotateInterval / 1000}s
                          </span>
                        </div>
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
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>2s</span>
                          <span>6s</span>
                          <span>10s</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {template !== "grid" && template !== "carousel" && (
                <p className="text-xs text-muted-foreground bg-neutral-50 border border-border rounded-lg px-3 py-2.5">
                  No layout options for this template — switch to Grid or Carousel to
                  configure spacing or timing.
                </p>
              )}
            </TabsContent>

            {/* TESTIMONIALS */}
            <TabsContent value="testimonials" className="space-y-3 mt-0">
              <p className={EYEBROW}>
                {selectedTestimonials.length} of {allTestimonials.length} selected
              </p>
              <div className="space-y-2">
                {allTestimonials.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-xs bg-neutral-50 border border-border rounded-lg">
                    No published testimonials yet. Publish some from the Testimonials
                    page first.
                  </div>
                ) : (
                  allTestimonials.map((testimonial) => {
                    const checked = selectedTestimonials.includes(testimonial.id);
                    return (
                      <div
                        key={testimonial.id}
                        className={`border rounded-lg p-2.5 cursor-pointer transition ${
                          checked
                            ? "border-primary/40 bg-primary-soft/30"
                            : "border-border hover:border-neutral-300"
                        }`}
                        onClick={() => toggleTestimonial(testimonial.id)}
                      >
                        <div className="flex items-start gap-2">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleTestimonial(testimonial.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5 gap-2">
                              <span className="font-semibold text-xs text-foreground truncate">
                                {testimonial.authorName}
                              </span>
                              <div className="flex gap-0.5 shrink-0">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-2.5 w-2.5 ${
                                      i < testimonial.rating
                                        ? "text-primary fill-primary"
                                        : "text-muted-foreground/40"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                              {testimonial.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </div>

          {/* Sticky footer — save + share */}
          <div className="px-5 py-3 border-t border-border bg-card flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saving || !name}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-1.5" />
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button
              onClick={() => setEmbedOpen(true)}
              disabled={!widget.shareId}
              variant="outline"
              className="flex-1"
              title={widget.shareId ? "Get embed code" : "Save the widget first to get an embed code"}
            >
              <Code2 className="h-4 w-4 mr-1.5" strokeWidth={1.75} />
              Get code
            </Button>
          </div>
        </Tabs>
      </div>

      {/* Right preview panel */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          backgroundColor: "#fafaf7",
          backgroundImage:
            "radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div className="p-8 md:p-12">
          <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className={EYEBROW.replace("mb-3", "mb-1")}>Live preview</p>
              <p className="text-sm text-muted-foreground">
                Your changes show here in real time.
              </p>
            </div>
            {widget.shareId && (
              <a
                href={`/widget/${widget.shareId}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-primary hover:underline"
              >
                Open public page ↗
              </a>
            )}
          </div>
          <div className="bg-card rounded-xl border border-border p-8 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)]">
            {renderPreview()}
          </div>
        </div>
      </div>

      {/* Embed code */}
      {widget.shareId && (
        <EmbedDialog
          open={embedOpen}
          onOpenChange={setEmbedOpen}
          shareId={widget.shareId}
          kind="widget"
        />
      )}
    </div>
  );
}

function BrandingToggle() {
  const { data } = useUserPlan();
  const { showUpgrade } = useUpgradeDialog();
  const isPro = data?.plan === "PRO";

  return (
    <div className="flex items-center justify-between bg-neutral-50 border border-border rounded-lg px-3 py-2.5">
      <div className="flex items-start gap-2.5">
        {!isPro && (
          <Lock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
        )}
        <div>
          <p className="text-xs font-medium text-foreground">
            Remove &ldquo;Powered by aboast&rdquo;
            {!isPro && (
              <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary-soft px-1.5 py-0.5 rounded-md align-middle">
                Pro
              </span>
            )}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {isPro
              ? "The watermark is hidden on your public widget pages automatically."
              : "Hide the watermark on public widget + wall pages on Pro."}
          </p>
        </div>
      </div>
      {!isPro && (
        <button
          type="button"
          onClick={() =>
            showUpgrade({ kind: "premium_feature", resource: "branding" })
          }
          className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <SparklesIcon className="h-3 w-3" strokeWidth={2} />
          Upgrade
        </button>
      )}
    </div>
  );
}
