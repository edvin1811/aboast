"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, CheckCircle2, ArrowRight } from "lucide-react";
import { TrackingPixel } from "@/components/widgets/TrackingPixel";
import { IframeAutoResize } from "@/components/widgets/IframeAutoResize";

interface FormField {
  id: string;
  name: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  enabled: boolean;
}

interface Form {
  id: string;
  name: string;
  shareId: string;
  description: string | null;
  fields: FormField[];
  thankYouMessage: string;
  isActive: boolean;
  ownerPlan?: "FREE" | "PRO";
  isClosed?: boolean;
}

function PageShell({
  children,
  shareId,
}: {
  children: React.ReactNode;
  shareId?: string;
}) {
  return (
    <div className="relative min-h-screen">
      <div className="page-wash" aria-hidden="true" />
      <div className="relative z-10 flex flex-col items-center px-6 py-16 md:py-24">
        {children}
      </div>
      {shareId && (
        <>
          <TrackingPixel type="form" shareId={shareId} />
          <IframeAutoResize shareId={shareId} />
        </>
      )}
    </div>
  );
}

export default function SubmitFormPage({ params }: { params: Promise<{ shareId: string }> }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<Form | null>(null);
  const [shareId, setShareId] = useState("");
  const [rating, setRating] = useState(5);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    params.then((p) => {
      setShareId(p.shareId);
      fetchForm(p.shareId);
    });
  }, []);

  const fetchForm = async (formShareId: string) => {
    try {
      const response = await fetch(`/api/forms/public/${formShareId}`);
      if (response.ok) {
        const data = await response.json();
        setForm(data);
        const initialData: Record<string, string> = {};
        data.fields.forEach((field: FormField) => {
          initialData[field.name] = "";
        });
        setFormData(initialData);
      }
    } catch (error) {
      console.error("Error fetching form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formShareId: shareId,
          rating,
          ...formData,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert("Failed to submit. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageShell shareId={shareId}>
        <div className="w-full max-w-2xl">
          <div className="bg-white border border-border rounded-2xl p-8 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_24px_48px_-24px_rgba(15,15,15,0.16)]">
            <div className="h-8 w-64 bg-neutral-100 animate-pulse rounded mb-4" />
            <div className="h-4 w-full bg-neutral-100 animate-pulse rounded mb-2" />
            <div className="h-4 w-3/4 bg-neutral-100 animate-pulse rounded" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (!form || !form.isActive) {
    return (
      <PageShell shareId={shareId}>
        <div className="w-full max-w-2xl text-center">
          <div className="bg-white border border-border rounded-2xl p-12 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_24px_48px_-24px_rgba(15,15,15,0.16)]">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
              This form is no longer{" "}
              <span className="font-serif italic text-primary">available</span>.
            </h2>
            <p className="text-muted-foreground">It may have been deactivated or removed.</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (form.isClosed) {
    return (
      <PageShell shareId={shareId}>
        <div className="w-full max-w-2xl text-center">
          <div className="bg-white border border-border rounded-2xl p-12 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_24px_48px_-24px_rgba(15,15,15,0.16)]">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
              This form is currently{" "}
              <span className="font-serif italic text-primary">closed</span>.
            </h2>
            <p className="text-muted-foreground">
              We&rsquo;re not collecting new responses right now — check back soon.
            </p>
          </div>
          {form.ownerPlan !== "PRO" && (
            <p className="text-center text-xs text-muted-foreground mt-6">
              Powered by aboast
            </p>
          )}
        </div>
      </PageShell>
    );
  }

  if (submitted) {
    return (
      <PageShell shareId={shareId}>
        <div className="w-full max-w-2xl text-center">
          <div className="relative bg-white border border-border rounded-2xl p-12 md:p-16 overflow-hidden shadow-[0_1px_2px_rgba(15,15,15,0.04),0_24px_48px_-24px_rgba(15,15,15,0.16)]">
            <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-soft border border-primary/30 grid place-items-center text-primary shadow-[0_0_30px_rgba(255,89,94,0.18)] mb-6">
              <CheckCircle2 className="h-7 w-7" strokeWidth={1.75} />
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4 leading-[1.1]">
              Thanks — you{" "}
              <span className="font-serif italic text-primary">made our day</span>.
            </h2>
            <p className="text-muted-foreground text-lg whitespace-pre-wrap max-w-md mx-auto leading-relaxed">
              {form.thankYouMessage}
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell shareId={shareId}>
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-white/80 backdrop-blur-sm mb-6 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(255,89,94,0.6)]" />
            Share your story
          </span>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground leading-[1.05] mb-4">
            {form.name}
          </h1>
          {form.description && (
            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              {form.description}
            </p>
          )}
        </div>

        {/* Form card */}
        <div className="bg-white border border-border rounded-2xl p-8 md:p-10 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_24px_48px_-24px_rgba(15,15,15,0.16)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {form.fields.map((field) => {
              if (field.name === "rating") {
                return (
                  <div key={field.id} className="space-y-2.5">
                    <Label>
                      {field.label}
                      {field.required && <span className="text-primary ml-1">*</span>}
                    </Label>
                    <div className="flex gap-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setRating(i + 1)}
                          className="transition-all hover:scale-110"
                        >
                          <Star
                            className={`h-9 w-9 ${
                              i < rating
                                ? "text-primary fill-primary"
                                : "text-neutral-300"
                            }`}
                            strokeWidth={i < rating ? 0 : 1.5}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }

              if (field.type === "textarea") {
                return (
                  <div key={field.id} className="space-y-2.5">
                    <Label htmlFor={field.name}>
                      {field.label}
                      {field.required && <span className="text-primary ml-1">*</span>}
                    </Label>
                    <Textarea
                      id={field.name}
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.name]: e.target.value })
                      }
                      placeholder={field.placeholder}
                      required={field.required}
                      rows={5}
                      className="resize-none"
                    />
                  </div>
                );
              }

              return (
                <div key={field.id} className="space-y-2.5">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-primary ml-1">*</span>}
                  </Label>
                  <Input
                    id={field.name}
                    type={field.type}
                    value={formData[field.name] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: e.target.value })
                    }
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                </div>
              );
            })}

            <Button type="submit" disabled={submitting} className="w-full group" size="lg">
              {submitting ? "Submitting..." : "Submit testimonial"}
              {!submitting && (
                <ArrowRight className="w-[18px] h-[18px] transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
              )}
            </Button>
          </form>
        </div>

        {form.ownerPlan !== "PRO" && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            Powered by aboast
          </p>
        )}
      </div>
    </PageShell>
  );
}
