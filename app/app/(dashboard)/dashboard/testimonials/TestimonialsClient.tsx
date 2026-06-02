"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  Star,
  Filter,
  Search,
  MessageSquare,
  Trash2,
  Eye,
  EyeOff,
  Tag,
  X,
  FileText,
  Globe,
  PenSquare,
  Edit,
  Calendar,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Form {
  id: string;
  name: string;
  slug: string;
}

interface Testimonial {
  id: string;
  content: string;
  rating: number;
  authorName: string;
  authorEmail: string | null;
  authorTitle: string | null;
  authorCompany: string | null;
  authorImage: string | null;
  isPublished: boolean;
  tags: string[];
  source: string | null;
  sourceUrl: string | null;
  createdAt: Date;
  form: Form | null;
}

interface TestimonialsClientProps {
  testimonials: Testimonial[];
}

const SOURCE_ICONS = {
  form: FileText,
  import: Globe,
  manual: PenSquare,
};

const SOURCE_LABELS = {
  form: "Form",
  import: "Imported",
  manual: "Manual",
};

const SOURCE_COLORS = {
  form: "bg-blue-100 text-blue-700",
  import: "bg-green-100 text-green-700",
  manual: "bg-primary-soft text-primary",
};

export function TestimonialsClient({ testimonials }: TestimonialsClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [bulkTagInput, setBulkTagInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Detail dialog state
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [editForm, setEditForm] = useState({
    content: "",
    rating: 5,
    authorName: "",
    authorEmail: "",
    authorTitle: "",
    authorCompany: "",
    authorImage: "",
    tags: [] as string[],
    isPublished: false,
  });

  // Filters
  const [showPublished, setShowPublished] = useState(true);
  const [showDraft, setShowDraft] = useState(true);
  const [minRating, setMinRating] = useState(0);
  const [selectedSources, setSelectedSources] = useState<string[]>(["form", "import", "manual"]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all unique tags from testimonials
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    testimonials.forEach((t) => t.tags?.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [testimonials]);

  // Get all unique sources
  const allSources = useMemo(() => {
    const sourceSet = new Set<string>();
    testimonials.forEach((t) => {
      if (t.source) sourceSet.add(t.source);
    });
    return Array.from(sourceSet);
  }, [testimonials]);

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((testimonial) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        testimonial.content.toLowerCase().includes(searchLower) ||
        testimonial.authorName.toLowerCase().includes(searchLower) ||
        testimonial.authorCompany?.toLowerCase().includes(searchLower) ||
        testimonial.authorTitle?.toLowerCase().includes(searchLower) ||
        testimonial.form?.name.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus =
        (showPublished && testimonial.isPublished) ||
        (showDraft && !testimonial.isPublished);

      // Rating filter
      const matchesRating = testimonial.rating >= minRating;

      // Source filter
      const matchesSource =
        selectedSources.length === 0 ||
        (testimonial.source && selectedSources.includes(testimonial.source));

      // Tags filter
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => testimonial.tags?.includes(tag));

      return matchesSearch && matchesStatus && matchesRating && matchesSource && matchesTags;
    });
  }, [testimonials, searchQuery, showPublished, showDraft, minRating, selectedSources, selectedTags]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (!showPublished || !showDraft) count++;
    if (minRating > 0) count++;
    if (selectedSources.length !== allSources.length) count++;
    if (selectedTags.length > 0) count++;
    return count;
  }, [showPublished, showDraft, minRating, selectedSources, selectedTags, allSources]);

  const handleSelectAll = () => {
    if (selectedIds.length === filteredTestimonials.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTestimonials.map((t) => t.id));
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) return;

    try {
      const response = await fetch("/api/testimonials/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          testimonialIds: selectedIds,
        }),
      });

      if (response.ok) {
        setSelectedIds([]);
        router.refresh();
      } else {
        alert("Failed to perform action");
      }
    } catch (error) {
      console.error("Error performing bulk action:", error);
      alert("An error occurred");
    }
  };

  const handleBulkAddTags = async () => {
    if (selectedIds.length === 0 || !bulkTagInput.trim()) return;

    const tags = bulkTagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const response = await fetch("/api/testimonials/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addTags",
          testimonialIds: selectedIds,
          tags,
        }),
      });

      if (response.ok) {
        setSelectedIds([]);
        setBulkTagInput("");
        setIsTagDialogOpen(false);
        router.refresh();
      } else {
        alert("Failed to add tags");
      }
    } catch (error) {
      console.error("Error adding tags:", error);
      alert("An error occurred");
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;

    const confirmed = confirm(`Delete ${selectedIds.length} testimonial(s)? This cannot be undone.`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await handleBulkAction("delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSourceFilter = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  };

  const toggleTagFilter = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getSourceIcon = (source: string | null) => {
    if (!source) return PenSquare;
    return SOURCE_ICONS[source as keyof typeof SOURCE_ICONS] || PenSquare;
  };

  const getSourceLabel = (testimonial: Testimonial) => {
    if (testimonial.source === "form" && testimonial.form) {
      return testimonial.form.name;
    }
    return SOURCE_LABELS[testimonial.source as keyof typeof SOURCE_LABELS] || "Unknown";
  };

  const getSourceColor = (source: string | null) => {
    if (!source) return "bg-gray-100 text-gray-700";
    return SOURCE_COLORS[source as keyof typeof SOURCE_COLORS] || "bg-gray-100 text-gray-700";
  };

  const openDetailDialog = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    const tags = testimonial.tags || [];
    setTagInput(tags.join(", "));
    setEditForm({
      content: testimonial.content,
      rating: testimonial.rating,
      authorName: testimonial.authorName,
      authorEmail: testimonial.authorEmail || "",
      authorTitle: testimonial.authorTitle || "",
      authorCompany: testimonial.authorCompany || "",
      authorImage: testimonial.authorImage || "",
      tags: tags,
      isPublished: testimonial.isPublished,
    });
    setIsEditing(false);
    setIsDetailDialogOpen(true);
  };

  const handleSaveTestimonial = async () => {
    if (!selectedTestimonial) return;

    // Parse tags from input
    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setIsSaving(true);
    try {
      const response = await fetch(`/api/testimonials/${selectedTestimonial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, tags }),
      });

      if (response.ok) {
        setIsDetailDialogOpen(false);
        setIsEditing(false);
        router.refresh();
      } else {
        alert("Failed to update testimonial");
      }
    } catch (error) {
      console.error("Error updating testimonial:", error);
      alert("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTestimonial = async () => {
    if (!selectedTestimonial) return;

    const confirmed = confirm("Delete this testimonial? This cannot be undone.");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/testimonials/${selectedTestimonial.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setIsDetailDialogOpen(false);
        router.refresh();
      } else {
        alert("Failed to delete testimonial");
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      alert("An error occurred");
    }
  };

  const handleTogglePublish = async () => {
    if (!selectedTestimonial) return;

    try {
      const response = await fetch(`/api/testimonials/${selectedTestimonial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !selectedTestimonial.isPublished }),
      });

      if (response.ok) {
        router.refresh();
        setSelectedTestimonial({
          ...selectedTestimonial,
          isPublished: !selectedTestimonial.isPublished,
        });
        setEditForm({ ...editForm, isPublished: !selectedTestimonial.isPublished });
      } else {
        alert("Failed to update testimonial");
      }
    } catch (error) {
      console.error("Error updating testimonial:", error);
      alert("An error occurred");
    }
  };

  return (
    <>
      {/* Search Bar and Filter Button */}
      <div className="flex gap-4 mb-6">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search testimonials, authors, forms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Filter Button with Sheet */}
        <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="lg" className="relative gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-primary text-white rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>

          {/* Filter Sheet Panel */}
          <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader className="pb-6 border-b border-border/50">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-2xl font-bold text-primary">
                  Search and Filter
                </SheetTitle>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setShowPublished(true);
                      setShowDraft(true);
                      setMinRating(0);
                      setSelectedSources(allSources);
                      setSelectedTags([]);
                    }}
                    className="text-primary hover:text-primary/80"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </SheetHeader>

            <div className="space-y-6 py-6">
              {/* Status Filter Section */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Status</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox
                      checked={showPublished}
                      onCheckedChange={(v) => setShowPublished(v === true)}
                    />
                    <span className="text-sm text-foreground">Published</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox
                      checked={showDraft}
                      onCheckedChange={(v) => setShowDraft(v === true)}
                    />
                    <span className="text-sm text-foreground">Draft</span>
                  </label>
                </div>
              </div>

              {/* Rating Filter Section */}
              <div className="pt-6 border-t border-border/50">
                <h3 className="text-sm font-semibold text-foreground mb-3">Rating</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox
                      checked={minRating === 0}
                      onCheckedChange={() => setMinRating(0)}
                    />
                    <span className="text-sm text-foreground">All Ratings</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox
                      checked={minRating === 4}
                      onCheckedChange={() => setMinRating(4)}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">4+ Stars</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox
                      checked={minRating === 5}
                      onCheckedChange={() => setMinRating(5)}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">5 Stars Only</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Source Filter Section */}
              {allSources.length > 0 && (
                <div className="pt-6 border-t border-border/50">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Testimonial Source</h3>
                  <div className="space-y-2">
                    {allSources.map((source) => {
                      const SourceIcon = SOURCE_ICONS[source as keyof typeof SOURCE_ICONS] || PenSquare;
                      return (
                        <label key={source} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <Checkbox
                            checked={selectedSources.includes(source)}
                            onCheckedChange={() => toggleSourceFilter(source)}
                          />
                          <SourceIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">
                            {SOURCE_LABELS[source as keyof typeof SOURCE_LABELS] || source}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tags Filter Section */}
              {allTags.length > 0 && (
                <div className="pt-6 border-t border-border/50">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Your tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer hover:scale-105 transition-transform text-sm py-1.5 px-3"
                        onClick={() => toggleTagFilter(tag)}
                      >
                        <Tag className="h-3 w-3 mr-1.5" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Results Counter */}
            <div className="sticky bottom-0 left-0 right-0 pt-4 pb-2 border-t border-border/50 bg-background">
              <div className="text-sm text-center text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredTestimonials.length}</span> of {testimonials.length} testimonials
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filter Tags */}
      {selectedTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-6">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer hover:bg-destructive/20 hover:text-destructive transition-colors"
              onClick={() => toggleTagFilter(tag)}
            >
              {tag}
              <X className="h-3 w-3 ml-1.5" />
            </Badge>
          ))}
        </div>
      )}

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-primary text-white rounded-lg p-4 mb-6 shadow-lg animate-slide-in-top">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-semibold">{selectedIds.length} selected</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleBulkAction("publish")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Publish
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleBulkAction("unpublish")}
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Unpublish
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsTagDialogOpen(true)}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Add Tags
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds([])}
              className="text-white hover:bg-white/20"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Select All */}
      {filteredTestimonials.length > 0 && (
        <div className="flex items-center gap-2 mb-4 px-2">
          <Checkbox
            checked={selectedIds.length === filteredTestimonials.length && filteredTestimonials.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-muted-foreground">Select all</span>
        </div>
      )}

      {/* Testimonials Grid */}
      {filteredTestimonials.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center shadow-sm">
          <div className="bg-primary-soft border border-primary/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {testimonials.length === 0 ? "No testimonials yet" : "No testimonials match your filters"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {testimonials.length === 0
              ? "Get started by importing your first testimonial"
              : "Try adjusting your search or filters"}
          </p>
          {testimonials.length === 0 && (
            <Link href="/dashboard/testimonials/import">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Import Testimonials
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTestimonials.map((testimonial) => {
            const SourceIcon = getSourceIcon(testimonial.source);

            return (
              <div
                key={testimonial.id}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-lg group"
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div className="pt-1">
                    <Checkbox
                      checked={selectedIds.includes(testimonial.id)}
                      onCheckedChange={() => handleSelect(testimonial.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Content */}
                  <div
                    onClick={() => openDetailDialog(testimonial)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {testimonial.authorImage ? (
                          <img
                            src={testimonial.authorImage}
                            alt={testimonial.authorName}
                            className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/20"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-primary-soft border border-primary/30 flex items-center justify-center text-primary font-bold text-lg ring-2 ring-primary/20">
                            {testimonial.authorName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground truncate">
                            {testimonial.authorName}
                          </div>
                          {testimonial.authorTitle && (
                            <div className="text-xs text-muted-foreground truncate">
                              {testimonial.authorTitle}
                              {testimonial.authorCompany && ` • ${testimonial.authorCompany}`}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`text-xs ${getSourceColor(testimonial.source)}`}
                        >
                          <SourceIcon className="h-3 w-3 mr-1" />
                          {getSourceLabel(testimonial)}
                        </Badge>
                        <Badge
                          variant={testimonial.isPublished ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {testimonial.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < testimonial.rating
                                ? "text-primary fill-primary"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {testimonial.rating}.0
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed mb-4">
                      {testimonial.content}
                    </p>

                    {/* Tags */}
                    {testimonial.tags && testimonial.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {testimonial.tags.slice(0, 5).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs cursor-pointer hover:bg-primary hover:text-white transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleTagFilter(tag);
                            }}
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {testimonial.tags.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{testimonial.tags.length - 5}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-start pt-4 border-t border-border">
                      <div className="text-xs text-muted-foreground">
                        {new Date(testimonial.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                  
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            {!isEditing && (
              <div className="flex gap-2 justify-start">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant={selectedTestimonial?.isPublished ? "outline" : "default"}
                  onClick={handleTogglePublish}
                >
                  {selectedTestimonial?.isPublished ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Publish
                    </>
                  )}
                </Button>
              </div>
            )}
          </DialogHeader>

          {selectedTestimonial && (
            <div className="space-y-6">
              {/* Source Info */}
              <div className="flex items-center gap-2 flex-wrap p-3 bg-muted/30 rounded-lg">
                <Badge className={`${getSourceColor(selectedTestimonial.source)}`}>
                  {(() => {
                    const SourceIcon = getSourceIcon(selectedTestimonial.source);
                    return <SourceIcon className="h-3 w-3 mr-1" />;
                  })()}
                  {getSourceLabel(selectedTestimonial)}
                </Badge>
                <Badge variant={selectedTestimonial.isPublished ? "default" : "secondary"}>
                  {selectedTestimonial.isPublished ? "Published" : "Draft"}
                </Badge>
                {selectedTestimonial.form && (
                  <Badge variant="outline">
                    <FileText className="h-3 w-3 mr-1" />
                    {selectedTestimonial.form.name}
                  </Badge>
                )}
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-4">
                {selectedTestimonial.authorImage ? (
                  <img
                    src={selectedTestimonial.authorImage}
                    alt={selectedTestimonial.authorName}
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-primary-soft border border-primary/30 flex items-center justify-center text-primary font-bold text-2xl ring-2 ring-primary/20">
                    {selectedTestimonial.authorName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="authorName" className="text-xs">Name</Label>
                        <Input
                          id="authorName"
                          value={editForm.authorName}
                          onChange={(e) => setEditForm({ ...editForm, authorName: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="authorTitle" className="text-xs">Title</Label>
                          <Input
                            id="authorTitle"
                            value={editForm.authorTitle}
                            onChange={(e) => setEditForm({ ...editForm, authorTitle: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="authorCompany" className="text-xs">Company</Label>
                          <Input
                            id="authorCompany"
                            value={editForm.authorCompany}
                            onChange={(e) => setEditForm({ ...editForm, authorCompany: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="font-semibold text-lg">{selectedTestimonial.authorName}</div>
                      {selectedTestimonial.authorTitle && (
                        <div className="text-sm text-muted-foreground">
                          {selectedTestimonial.authorTitle}
                          {selectedTestimonial.authorCompany && ` • ${selectedTestimonial.authorCompany}`}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div>
                {isEditing ? (
                  <>
                    <Label className="text-sm font-medium mb-2 block">Rating</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, rating })}
                          className="focus:outline-none hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`h-8 w-8 transition-colors ${
                              rating <= editForm.rating
                                ? "text-primary fill-primary"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < selectedTestimonial.rating
                              ? "text-primary fill-primary"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-base font-semibold ml-1">{selectedTestimonial.rating}.0</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
                {isEditing ? (
                  <>
                    <Label className="text-sm font-medium mb-2 block">Testimonial</Label>
                    <Textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      rows={6}
                      className="resize-none"
                    />
                  </>
                ) : (
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap text-base">
                    {selectedTestimonial.content}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Tags</Label>
                {isEditing ? (
                  <Input
                    placeholder="Separate tags with commas"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                  />
                ) : selectedTestimonial.tags && selectedTestimonial.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedTestimonial.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tags</p>
                )}
              </div>

              {/* Source URL if available */}
              {!isEditing && selectedTestimonial.sourceUrl && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Source URL</Label>
                  <a
                    href={selectedTestimonial.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm break-all"
                  >
                    {selectedTestimonial.sourceUrl}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Created Date at Bottom */}
          {selectedTestimonial && !isEditing && (
            <div className="pt-4 mt-2 border-t border-border/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  Created {new Date(selectedTestimonial.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          )}

          {isEditing && (
            <DialogFooter className="mt-6">
              <div className="flex justify-between w-full items-center">
                <Button
                  variant="destructive"
                  onClick={handleDeleteTestimonial}
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset all form fields to original values
                      if (selectedTestimonial) {
                        const tags = selectedTestimonial.tags || [];
                        setTagInput(tags.join(", "));
                        setEditForm({
                          content: selectedTestimonial.content,
                          rating: selectedTestimonial.rating,
                          authorName: selectedTestimonial.authorName,
                          authorEmail: selectedTestimonial.authorEmail || "",
                          authorTitle: selectedTestimonial.authorTitle || "",
                          authorCompany: selectedTestimonial.authorCompany || "",
                          authorImage: selectedTestimonial.authorImage || "",
                          tags: tags,
                          isPublished: selectedTestimonial.isPublished,
                        });
                      }
                    }}
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveTestimonial} disabled={isSaving} size="sm">
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Tags Dialog */}
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tags</DialogTitle>
            <DialogDescription>
              Add tags to {selectedIds.length} selected testimonial(s). Separate multiple tags with commas.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="e.g. verified, 5-star, featured"
              value={bulkTagInput}
              onChange={(e) => setBulkTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleBulkAddTags()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkAddTags} disabled={!bulkTagInput.trim()}>
              Add Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
