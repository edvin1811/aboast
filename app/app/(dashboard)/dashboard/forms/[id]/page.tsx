"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { ArrowLeft, Save, Trash2, Code, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { FormPreview } from "@/components/FormPreview";

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
  slug: string;
  description: string | null;
  isActive: boolean;
  autoPublish: boolean;
  thankYouMessage: string;
  fields: FormField[];
}

export default function FormEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<Form | null>(null);
  const [id, setId] = useState<string>("");

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thankYouMessage, setThankYouMessage] = useState(
    "Thank you for your testimonial! We really appreciate your feedback."
  );
  const [autoPublish, setAutoPublish] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [fields, setFields] = useState<FormField[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);

  // Section collapse state
  const [basicInfoOpen, setBasicInfoOpen] = useState(true);
  const [fieldsOpen, setFieldsOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      fetchData(p.id);
    });
  }, []);

  const fetchData = async (formId: string) => {
    try {
      const response = await fetch(`/api/forms/${formId}`);

      if (response.ok) {
        const formData = await response.json();
        setForm(formData);
        setName(formData.name);
        setDescription(formData.description || "");
        setThankYouMessage(formData.thankYouMessage);
        setAutoPublish(formData.autoPublish);
        setIsActive(formData.isActive);
        setFields(formData.fields || []);
      } else {
        router.push("/dashboard/forms");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      router.push("/dashboard/forms");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const enabledFields = fields.filter((f) => f.enabled);

      const response = await fetch(`/api/forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          fields: enabledFields,
          thankYouMessage,
          autoPublish,
          isActive,
        }),
      });

      if (response.ok) {
        router.push("/dashboard/forms");
        router.refresh();
      } else {
        alert("Failed to save form");
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
      const response = await fetch(`/api/forms/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/dashboard/forms");
        router.refresh();
      } else {
        alert("Failed to delete form");
        setDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("An error occurred");
      setDeleting(false);
    }
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, ...updates } : field))
    );
  };

  const toggleField = (id: string) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, enabled: !field.enabled } : field
      )
    );
  };

  const getEmbedCode = () => {
    if (!form) return "";
    const baseUrl = window.location.origin;
    return `<iframe src="${baseUrl}/submit/${form.slug}" width="100%" height="600" frameborder="0"></iframe>`;
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

  if (!form) {
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
              href="/dashboard/forms"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forms
            </Link>
            <div className="space-y-3">
              <Label htmlFor="formName" className="text-xs text-muted-foreground">
                Form Name
              </Label>
              <Input
                id="formName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="font-semibold"
                placeholder="Form Name"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
                  {isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Basic Info Section */}
          <div className="border-b border-border">
            <button
              onClick={() => setBasicInfoOpen(!basicInfoOpen)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <span className="font-semibold text-sm">Basic Information</span>
              {basicInfoOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {basicInfoOpen && (
              <div className="px-6 pb-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Help us understand your experience"
                    rows={3}
                    className="text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Shown at the top of the form
                  </p>
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

          {/* Form Fields Section */}
          <div className="border-b border-border">
            <button
              onClick={() => setFieldsOpen(!fieldsOpen)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <span className="font-semibold text-sm">
                Form Fields ({fields.filter((f) => f.enabled).length})
              </span>
              {fieldsOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {fieldsOpen && (
              <div className="px-6 pb-4">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className={`border border-border rounded-lg p-3 transition ${
                        field.enabled ? "bg-background" : "bg-muted/50 opacity-60"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Checkbox
                          checked={field.enabled}
                          onCheckedChange={() => toggleField(field.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Label className="font-semibold text-xs">{field.name}</Label>
                              {field.required && field.enabled && (
                                <span className="text-xs text-destructive">*</span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground capitalize">
                              {field.type}
                            </span>
                          </div>

                          {field.enabled && (
                            <>
                              <div className="space-y-2">
                                <div className="space-y-1">
                                  <Label htmlFor={`${field.id}-label`} className="text-xs">
                                    Label
                                  </Label>
                                  <Input
                                    id={`${field.id}-label`}
                                    value={field.label}
                                    onChange={(e) =>
                                      updateField(field.id, { label: e.target.value })
                                    }
                                    placeholder="Field label"
                                    className="text-xs h-8"
                                  />
                                </div>
                                {field.type !== "rating" && (
                                  <div className="space-y-1">
                                    <Label htmlFor={`${field.id}-placeholder`} className="text-xs">
                                      Placeholder
                                    </Label>
                                    <Input
                                      id={`${field.id}-placeholder`}
                                      value={field.placeholder}
                                      onChange={(e) =>
                                        updateField(field.id, {
                                          placeholder: e.target.value,
                                        })
                                      }
                                      placeholder="Placeholder text"
                                      className="text-xs h-8"
                                    />
                                  </div>
                                )}
                              </div>

                              {field.id !== "content" &&
                                field.id !== "rating" &&
                                field.id !== "authorName" && (
                                  <div className="flex items-center gap-2 pt-1">
                                    <Checkbox
                                      id={`${field.id}-required`}
                                      checked={field.required}
                                      onCheckedChange={(checked) =>
                                        updateField(field.id, { required: !!checked })
                                      }
                                    />
                                    <Label
                                      htmlFor={`${field.id}-required`}
                                      className="text-xs cursor-pointer"
                                    >
                                      Required
                                    </Label>
                                  </div>
                                )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Settings Section */}
          <div className="border-b border-border">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <span className="font-semibold text-sm">Form Settings</span>
              {settingsOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {settingsOpen && (
              <div className="px-6 pb-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="thankYouMessage" className="text-xs">
                    Thank You Message
                  </Label>
                  <Textarea
                    id="thankYouMessage"
                    value={thankYouMessage}
                    onChange={(e) => setThankYouMessage(e.target.value)}
                    rows={3}
                    placeholder="Thank you for your feedback!"
                    className="text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Shown after form submission
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="autoPublish" className="text-xs">
                    Auto-publish
                  </Label>
                  <Switch
                    id="autoPublish"
                    checked={autoPublish}
                    onCheckedChange={setAutoPublish}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Automatically publish submitted testimonials
                </p>
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
              See how your form will look
            </p>
          </div>
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <FormPreview
              formName={name || "Your Form Name"}
              description={description}
              fields={fields}
            />
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Form</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this form? This action cannot be undone
              and will prevent new testimonial submissions.
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
              {deleting ? "Deleting..." : "Delete Form"}
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
              Copy this code and paste it into your website where you want the form to
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
