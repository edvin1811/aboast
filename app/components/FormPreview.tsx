"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface FormField {
  id: string;
  name: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  enabled: boolean;
}

interface FormPreviewProps {
  formName: string;
  description: string;
  fields: FormField[];
}

export function FormPreview({ formName, description, fields }: FormPreviewProps) {
  // Mock fields to show when form has no fields
  const mockFields: FormField[] = [
    {
      id: "mock-content",
      name: "content",
      type: "textarea",
      label: "Your Testimonial",
      placeholder: "Tell us about your experience...",
      required: true,
      enabled: true,
    },
    {
      id: "mock-rating",
      name: "rating",
      type: "rating",
      label: "Rating",
      placeholder: "",
      required: true,
      enabled: true,
    },
    {
      id: "mock-name",
      name: "name",
      type: "text",
      label: "Your Name",
      placeholder: "John Doe",
      required: true,
      enabled: true,
    },
  ];

  const enabledFields = fields.filter((f) => f.enabled);
  const displayFields = enabledFields.length > 0 ? enabledFields : mockFields;

  return (
    <div className="bg-neutral-50 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-card border border-border rounded-lg p-8 shadow-xl">
          {/* Header */}
          <div className="mb-8 animate-slide-in-top">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {formName || "Your Form Name"}
            </h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-6 animate-slide-in-bottom">
            {displayFields.map((field, index) => (
              <div key={field.id} className="space-y-2" style={{ animationDelay: `${index * 0.05}s` }}>
                <Label>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>

                {field.type === "rating" ? (
                  <div className="flex gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-10 w-10 text-primary fill-primary cursor-pointer transition-transform hover:scale-110"
                      />
                    ))}
                  </div>
                ) : field.type === "textarea" ? (
                  <Textarea
                    placeholder={field.placeholder}
                    rows={6}
                    className="resize-none"
                    disabled
                  />
                ) : (
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    disabled
                  />
                )}
              </div>
            ))}

            <Button className="w-full" size="lg" disabled>
              Submit Testimonial
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
