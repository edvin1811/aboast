"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, FormInput, ExternalLink } from "lucide-react";
import { FormPreview } from "@/components/FormPreview";
import { PageBanner } from "../../components/PageBanner";

interface Form {
  id: string;
  name: string;
  slug: string;
  shareId: string;
  description: string | null;
  fields: string;
  isActive: boolean;
}

interface FormsClientProps {
  forms: Form[];
}

export function FormsClient({ forms }: FormsClientProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreate = async () => {
    if (!formName.trim()) return;

    setCreating(true);
    try {
      const slug = formName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          slug: slug || `form-${Date.now()}`,
        }),
      });

      if (!response.ok) throw new Error("Failed to create form");

      const form = await response.json();
      setOpen(false);
      setFormName("");
      router.push(`/dashboard/forms/${form.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error creating form:", error);
      alert("Failed to create form");
    } finally {
      setCreating(false);
    }
  };

  const dialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create form
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new form</DialogTitle>
          <DialogDescription>
            Enter a name for your form. You can customize it later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Form name</Label>
            <Input
              id="name"
              placeholder="Customer Feedback Form"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!formName.trim() || creating}>
            {creating ? "Creating..." : "Create form"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  const header = (
    <PageBanner
      eyebrow="Collect"
      title={
        <>
          Build <span className="font-serif italic text-primary">forms</span> that fill themselves
        </>
      }
      description="Custom forms to collect testimonials directly from your customers."
      action={dialog}
    />
  );

  if (!mounted) {
    return <div className="space-y-12">{header}</div>;
  }

  return (
    <div className="space-y-12">
      {header}

      {forms.length === 0 ? (
        <div className="bg-white border border-border rounded-3xl p-16 text-center shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)]">
          <div className="w-14 h-14 mx-auto mb-6 bg-primary-soft border border-primary/30 rounded-2xl flex items-center justify-center text-primary">
            <FormInput className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <h3 className="text-xl font-semibold tracking-tight text-foreground mb-2">
            No forms yet
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first form to start collecting testimonials from your customers.
          </p>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create your first form
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <div
              key={form.id}
              className="group bg-white border border-border rounded-3xl overflow-hidden transition-all hover:border-neutral-300 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)]"
            >
              <div className="bg-neutral-50 border-b border-border p-4">
                <div className="bg-background rounded-md overflow-hidden">
                  <div className="scale-[0.4] origin-top-left w-[250%] h-48">
                    <FormPreview
                      formName={form.name}
                      description={form.description || ""}
                      fields={
                        typeof form.fields === "string"
                          ? JSON.parse(form.fields)
                          : form.fields || []
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 truncate">
                      {form.name}
                    </h3>
                    <div className="text-xs text-neutral-400 font-mono">
                      /{form.slug}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${
                      form.isActive
                        ? "bg-primary-soft text-primary border border-primary/20"
                        : "bg-neutral-100 text-muted-foreground border border-border"
                    }`}
                  >
                    {form.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {form.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {form.description}
                  </p>
                )}

                <div className="flex gap-2">
                  <Link href={`/dashboard/forms/${form.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <FormInput className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Link
                    href={`/submit/${form.shareId}`}
                    target="_blank"
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
