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
  Plus,
  ExternalLink,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { PageBanner } from "../../components/PageBanner";

interface Wall {
  id: string;
  name: string;
  slug: string;
  shareId: string | null;
  title: string | null;
  description: string | null;
  isActive: boolean;
  layout: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WallsClientProps {
  walls: Wall[];
  testimonialsCount: number;
}

export function WallsClient({ walls, testimonialsCount }: WallsClientProps) {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    title: "Wall of Love",
    description: "See what our customers are saying",
  });

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      alert("Please enter a name for your wall");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/walls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        setFormData({
          name: "",
          title: "Wall of Love",
          description: "See what our customers are saying",
        });
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create wall");
      }
    } catch (error) {
      console.error("Error creating wall:", error);
      alert("An error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = confirm(`Delete "${name}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/walls/${id}`, { method: "DELETE" });
      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to delete wall");
      }
    } catch (error) {
      console.error("Error deleting wall:", error);
      alert("An error occurred");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/walls/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to update wall");
      }
    } catch (error) {
      console.error("Error updating wall:", error);
      alert("An error occurred");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const getWallUrl = (shareId: string | null) => {
    if (!shareId) return "";
    return `${window.location.origin}/wall/${shareId}`;
  };

  return (
    <div className="space-y-12">
      <PageBanner
        eyebrow="Share"
        title={
          <>
            Walls of <span className="font-serif italic text-primary">love</span>
          </>
        }
        description="Showcase your testimonials in a beautiful, shareable page."
        action={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create wall
          </Button>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative overflow-hidden bg-white border border-primary/30 rounded-3xl p-6 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(255,89,94,0.20)]">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-primary/[0.08] blur-[40px] rounded-full pointer-events-none" />
          <div className="relative">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
              Walls
            </div>
            <div className="text-4xl font-semibold tracking-tight text-foreground leading-none">
              {walls.length}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">total walls created</div>
          </div>
        </div>
        <div className="bg-white border border-border rounded-3xl p-6 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)]">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
            Published testimonials
          </div>
          <div className="text-4xl font-semibold tracking-tight text-foreground leading-none">
            {testimonialsCount}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">available for walls</div>
        </div>
      </section>

      {walls.length === 0 ? (
        <div className="bg-white border border-border rounded-3xl p-16 text-center shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)]">
          <div className="w-14 h-14 mx-auto mb-6 bg-primary-soft border border-primary/30 rounded-2xl flex items-center justify-center text-primary">
            <Sparkles className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <h3 className="text-xl font-semibold tracking-tight text-foreground mb-2">
            Create your first wall of love
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Showcase all your testimonials in a beautiful, shareable page you can send to anyone.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create wall
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {walls.map((wall) => (
            <div
              key={wall.id}
              className="bg-white border border-border rounded-3xl p-6 transition-all hover:border-neutral-300 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)]"
            >
              <div className="flex items-start justify-between mb-4 gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {wall.name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {wall.title}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${
                    wall.isActive
                      ? "bg-primary-soft text-primary border border-primary/20"
                      : "bg-neutral-100 text-muted-foreground border border-border"
                  }`}
                >
                  {wall.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {wall.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {wall.description}
                </p>
              )}

              <div className="flex items-center gap-3 text-xs text-neutral-400 mb-4">
                <span className="px-2 py-0.5 rounded-[4px] bg-muted text-muted-foreground font-mono">
                  {wall.layout}
                </span>
                <span>{new Date(wall.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {wall.shareId && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => window.open(getWallUrl(wall.shareId), "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View wall
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => copyToClipboard(getWallUrl(wall.shareId))}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy link
                    </Button>
                  </>
                )}

                <div className="flex gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleToggleActive(wall.id, wall.isActive)}
                  >
                    {wall.isActive ? (
                      <EyeOff className="h-4 w-4 mr-2" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    {wall.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(wall.id, wall.name)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Wall of Love</DialogTitle>
            <DialogDescription>
              Create a beautiful page to showcase all your published testimonials.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="My Awesome Wall"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <p className="text-xs text-neutral-400">
                This is for your internal reference only.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Wall of Love"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="See what our customers are saying"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create wall"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
