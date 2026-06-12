"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useUserPlan } from "@/lib/use-user-plan";
import {
  useUpgradeDialog,
  handleQuotaResponse,
} from "@/lib/use-upgrade-dialog";

export default function NewTestimonialPage() {
  const router = useRouter();
  const { refresh: refreshPlan } = useUserPlan();
  const { showUpgrade } = useUpgradeDialog();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      content: formData.get("content"),
      rating,
      authorName: formData.get("authorName"),
      authorEmail: formData.get("authorEmail"),
      authorTitle: formData.get("authorTitle"),
      authorCompany: formData.get("authorCompany"),
      authorImage: formData.get("authorImage"),
      isPublished: formData.get("isPublished") === "on",
    };

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (await handleQuotaResponse(response, showUpgrade)) {
        setLoading(false);
        return;
      }

      if (response.ok) {
        await refreshPlan();
        router.push("/dashboard/testimonials");
        router.refresh();
      } else {
        alert("Failed to create testimonial");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/testimonials"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Testimonials
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Add New Testimonial
        </h1>
        <p className="text-muted-foreground">
          Manually add a customer testimonial to your collection
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-semibold text-foreground">
            Testimonial Content
          </h2>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Testimonial Text *</Label>
            <Textarea
              id="content"
              name="content"
              required
              rows={6}
              placeholder="Enter the testimonial content..."
              className="resize-none"
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 transition ${
                      i < rating
                        ? "text-primary fill-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground self-center">
                {rating} {rating === 1 ? "star" : "stars"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-semibold text-foreground">
            Author Information
          </h2>

          {/* Author Name */}
          <div className="space-y-2">
            <Label htmlFor="authorName">Name *</Label>
            <Input
              id="authorName"
              name="authorName"
              required
              placeholder="John Doe"
            />
          </div>

          {/* Author Email */}
          <div className="space-y-2">
            <Label htmlFor="authorEmail">Email</Label>
            <Input
              id="authorEmail"
              name="authorEmail"
              type="email"
              placeholder="john@example.com"
            />
          </div>

          {/* Author Title */}
          <div className="space-y-2">
            <Label htmlFor="authorTitle">Job Title</Label>
            <Input
              id="authorTitle"
              name="authorTitle"
              placeholder="CEO"
            />
          </div>

          {/* Author Company */}
          <div className="space-y-2">
            <Label htmlFor="authorCompany">Company</Label>
            <Input
              id="authorCompany"
              name="authorCompany"
              placeholder="Acme Inc."
            />
          </div>

          {/* Author Image URL */}
          <div className="space-y-2">
            <Label htmlFor="authorImage">Profile Image URL</Label>
            <Input
              id="authorImage"
              name="authorImage"
              type="url"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-neutral-400">
              Optional: Enter a URL to the author&apos;s profile image
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-semibold text-foreground">Settings</h2>

          {/* Published */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <Label htmlFor="isPublished" className="cursor-pointer">
              Publish immediately
            </Label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Testimonial"}
          </Button>
          <Link href="/dashboard/testimonials">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
