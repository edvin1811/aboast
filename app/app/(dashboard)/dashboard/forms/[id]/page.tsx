"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserPlan } from "@/lib/use-user-plan";
import { useUpgradeDialog } from "@/lib/use-upgrade-dialog";
import { Lock, Sparkles as SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Save, Trash2, Code2 } from "lucide-react";
import { FormPreview } from "@/components/FormPreview";
import { EmbedDialog } from "@/components/EmbedDialog";

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
  shareId: string | null;
  description: string | null;
  isActive: boolean;
  autoPublish: boolean;
  thankYouMessage: string;
  fields: FormField[];
}

const EYEBROW =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3";

export default function FormEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<Form | null>(null);
  const [id, setId] = useState<string>("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thankYouMessage, setThankYouMessage] = useState(
    "Thank you for your testimonial! We really appreciate your feedback."
  );
  const [autoPublish, setAutoPublish] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [fields, setFields] = useState<FormField[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);

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
      const response = await fetch(`/api/forms/${id}`, { method: "DELETE" });
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

  const updateField = (fid: string, updates: Partial<FormField>) => {
    setFields((prev) =>
      prev.map((field) => (field.id === fid ? { ...field, ...updates } : field))
    );
  };

  const toggleField = (fid: string) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === fid ? { ...field, enabled: !field.enabled } : field
      )
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="w-72 bg-card border-r border-border p-6">
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

  if (!form) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left editor panel */}
      <div className="w-[336px] bg-card border-r border-border flex flex-col">
        {/* Header — navigation chrome only. The Tabs below are the
            primary "where am I in the editor" indicator. */}
        <div className="px-5 pt-5 pb-3">
          <Link
            href="/dashboard/forms"
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to forms
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-foreground text-base truncate flex-1">
              {name || "Untitled form"}
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

        {/* Tabs */}
        <Tabs defaultValue="basic" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-5 mt-4 grid grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="fields">Fields</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <TabsContent value="basic" className="space-y-5 mt-0">
              <div>
                <p className={EYEBROW}>Identity</p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="formName" className="text-xs">
                      Form name
                    </Label>
                    <Input
                      id="formName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Customer feedback form"
                    />
                  </div>
                  <div className="space-y-1.5">
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
                    <p className="text-[11px] text-muted-foreground">
                      Shown at the top of the form.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className={EYEBROW}>Visibility</p>
                <div className="flex items-center justify-between bg-neutral-50 border border-border rounded-lg px-3 py-2.5">
                  <div>
                    <Label htmlFor="active" className="text-xs font-medium">
                      Form is active
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Customers can submit testimonials.
                    </p>
                  </div>
                  <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fields" className="space-y-3 mt-0">
              <p className={EYEBROW}>
                {fields.filter((f) => f.enabled).length} of {fields.length} enabled
              </p>
              <div className="space-y-2">
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className={`border border-border rounded-lg p-3 transition ${
                      field.enabled ? "bg-card" : "bg-muted/40 opacity-60"
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
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                            {field.type}
                          </span>
                        </div>

                        {field.enabled && (
                          <>
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <Label htmlFor={`${field.id}-label`} className="text-[11px]">
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
                                  <Label
                                    htmlFor={`${field.id}-placeholder`}
                                    className="text-[11px]"
                                  >
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
                                    className="text-[11px] cursor-pointer"
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
            </TabsContent>

            <TabsContent value="settings" className="space-y-5 mt-0">
              <div>
                <p className={EYEBROW}>Submission flow</p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="thankYouMessage" className="text-xs">
                      Thank-you message
                    </Label>
                    <Textarea
                      id="thankYouMessage"
                      value={thankYouMessage}
                      onChange={(e) => setThankYouMessage(e.target.value)}
                      rows={3}
                      placeholder="Thank you for your feedback!"
                      className="text-xs"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Shown after a customer hits Submit.
                    </p>
                  </div>

                  <div className="flex items-center justify-between bg-neutral-50 border border-border rounded-lg px-3 py-2.5">
                    <div>
                      <Label htmlFor="autoPublish" className="text-xs font-medium">
                        Auto-publish submissions
                      </Label>
                      <p className="text-[11px] text-muted-foreground">
                        New testimonials skip moderation and appear live immediately.
                      </p>
                    </div>
                    <Switch
                      id="autoPublish"
                      checked={autoPublish}
                      onCheckedChange={setAutoPublish}
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className={EYEBROW}>Branding</p>
                <BrandingToggle />
              </div>

              <div>
                <p className={EYEBROW}>Danger zone</p>
                <div className="border border-destructive/30 rounded-lg p-3 bg-destructive/5">
                  <p className="text-xs text-foreground font-medium mb-1">
                    Delete this form
                  </p>
                  <p className="text-[11px] text-muted-foreground mb-3">
                    Permanently removes the form. Submitted testimonials stay in your
                    workspace.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="w-full"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Delete form
                  </Button>
                </div>
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
              disabled={!form.shareId}
              variant="outline"
              className="flex-1"
              title={form.shareId ? "Get embed code" : "Save the form first to get an embed code"}
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
                See how your form will look to customers.
              </p>
            </div>
            {form.shareId && (
              <a
                href={`/submit/${form.shareId}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-primary hover:underline"
              >
                Open public page ↗
              </a>
            )}
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)]">
            <FormPreview
              formName={name}
              description={description}
              fields={fields}
            />
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete form</DialogTitle>
            <DialogDescription>
              This permanently removes the form. Submitted testimonials remain in
              your workspace.
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
              {deleting ? "Deleting…" : "Delete form"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Embed code */}
      {form.shareId && (
        <EmbedDialog
          open={embedOpen}
          onOpenChange={setEmbedOpen}
          shareId={form.shareId}
          kind="form"
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
              ? "The watermark is hidden on all your forms automatically."
              : "Hide the watermark on your public submit pages on Pro."}
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
