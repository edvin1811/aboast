"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Save, Trash2, Star, X } from "lucide-react";
import Link from "next/link";

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
  createdAt: string;
}

export default function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [testimonialId, setTestimonialId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form state
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [authorTitle, setAuthorTitle] = useState("");
  const [authorCompany, setAuthorCompany] = useState("");
  const [authorImage, setAuthorImage] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    params.then((p) => {
      setTestimonialId(p.id);
      fetchTestimonial(p.id);
    });
  }, []);

  const fetchTestimonial = async (id: string) => {
    try {
      const response = await fetch(`/api/testimonials/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch testimonial");
      }
      const data: Testimonial = await response.json();

      setContent(data.content);
      setRating(data.rating);
      setAuthorName(data.authorName);
      setAuthorEmail(data.authorEmail || "");
      setAuthorTitle(data.authorTitle || "");
      setAuthorCompany(data.authorCompany || "");
      setAuthorImage(data.authorImage || "");
      setIsPublished(data.isPublished);
      setTags(data.tags || []);
    } catch (error) {
      console.error("Error fetching testimonial:", error);
      alert("Failed to load testimonial");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content || !authorName || !testimonialId) {
      alert("Please fill in required fields");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/testimonials/${testimonialId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          rating,
          authorName,
          authorEmail: authorEmail || null,
          authorTitle: authorTitle || null,
          authorCompany: authorCompany || null,
          authorImage: authorImage || null,
          isPublished,
          tags,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update testimonial");
      }

      router.push("/dashboard/testimonials");
      router.refresh();
    } catch (error) {
      console.error("Error updating testimonial:", error);
      alert("Failed to update testimonial");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!testimonialId) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/testimonials/${testimonialId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete testimonial");
      }

      router.push("/dashboard/testimonials");
      router.refresh();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      alert("Failed to delete testimonial");
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 animate-pulse">
          <div className="h-4 w-32 bg-muted rounded mb-4"></div>
          <div className="h-8 w-64 bg-muted rounded mb-2"></div>
          <div className="h-4 w-96 bg-muted rounded"></div>
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-muted rounded-lg"></div>
          <div className="h-48 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-slide-in-top">
        <Link
          href="/dashboard/testimonials"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Testimonials
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Edit Testimonial
            </h1>
            <p className="text-muted-foreground">
              Update testimonial content and settings
            </p>
          </div>
          <Badge variant={isPublished ? "success" : "outline"}>
            {isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
      </div>

      <div className="space-y-6 animate-slide-in-bottom">
        {/* Content Card */}
        <Card>
          <CardHeader>
            <CardTitle>Testimonial Content</CardTitle>
            <CardDescription>The main testimonial message</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter the testimonial content..."
                rows={6}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Rating *</Label>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 cursor-pointer ${
                        i < rating
                          ? "text-primary fill-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Author Information */}
        <Card>
          <CardHeader>
            <CardTitle>Author Information</CardTitle>
            <CardDescription>Details about who gave the testimonial</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="authorName">Name *</Label>
                <Input
                  id="authorName"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorEmail">Email</Label>
                <Input
                  id="authorEmail"
                  type="email"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="authorTitle">Title</Label>
                <Input
                  id="authorTitle"
                  value={authorTitle}
                  onChange={(e) => setAuthorTitle(e.target.value)}
                  placeholder="CEO"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorCompany">Company</Label>
                <Input
                  id="authorCompany"
                  value={authorCompany}
                  onChange={(e) => setAuthorCompany(e.target.value)}
                  placeholder="Acme Inc."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="authorImage">Profile Image URL</Label>
              <Input
                id="authorImage"
                value={authorImage}
                onChange={(e) => setAuthorImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>Organize testimonials with tags</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag..."
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Publication Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Publication Settings</CardTitle>
            <CardDescription>Control testimonial visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="published">Published</Label>
                <p className="text-sm text-muted-foreground">
                  Make this testimonial visible in widgets
                </p>
              </div>
              <Switch
                id="published"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Testimonial</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this testimonial? This action
                  cannot be undone.
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
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="flex gap-3">
            <Link href="/dashboard/testimonials">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={handleSave} disabled={saving || !content || !authorName}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
