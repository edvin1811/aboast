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
} from "@/components/ui/dialog";
import { Plus, FormInput, ExternalLink, Pencil, Settings2, Lock } from "lucide-react";
import { PageBanner } from "../../components/PageBanner";
import { FormThumbnail } from "@/components/FormThumbnail";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserPlan, isAtQuota } from "@/lib/use-user-plan";
import {
  useUpgradeDialog,
  handleQuotaResponse,
} from "@/lib/use-upgrade-dialog";

interface Form {
  id: string;
  name: string;
  slug: string;
  shareId: string | null;
  description: string | null;
  fields: unknown;
  isActive: boolean;
  views: number;
  _count?: { testimonials: number };
}

interface FormsClientProps {
  forms: Form[];
}

function formatStat(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toLocaleString();
}

function parseFields(raw: unknown): Array<{ id: string; type: string; enabled?: boolean }> {
  if (Array.isArray(raw)) return raw as any;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function StatTile({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="bg-neutral-50 border border-border rounded-lg px-3.5 py-2.5 min-w-[96px]">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </div>
      <div
        className={`text-lg font-semibold tracking-tight tabular-nums ${
          emphasize ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export function FormsClient({ forms }: FormsClientProps) {
  const router = useRouter();
  const { data: planData, refresh: refreshPlan } = useUserPlan();
  const { showUpgrade } = useUpgradeDialog();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const atFormQuota = isAtQuota(planData, "forms");

  const openCreateDialog = () => {
    if (atFormQuota && planData) {
      showUpgrade({
        kind: "quota_reached",
        resource: "form",
        current: planData.usage.forms,
        limit: planData.limits.forms,
      });
      return;
    }
    setOpen(true);
  };

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

      if (await handleQuotaResponse(response, showUpgrade)) {
        setOpen(false);
        setFormName("");
        return;
      }

      if (!response.ok) throw new Error("Failed to create form");

      const form = await response.json();
      setOpen(false);
      setFormName("");
      await refreshPlan();
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
      <Button onClick={openCreateDialog}>
        {atFormQuota ? (
          <Lock className="h-4 w-4 mr-2" />
        ) : (
          <Plus className="h-4 w-4 mr-2" />
        )}
        Create form
      </Button>
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
        <div className="bg-white border border-border rounded-2xl p-16 text-center shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_-12px_rgba(15,15,15,0.08)]">
          <div className="w-14 h-14 mx-auto mb-6 bg-neutral-100 border border-border rounded-xl flex items-center justify-center text-foreground/70">
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
        <div className="space-y-4">
          {forms.map((form) => {
            const submissions = form._count?.testimonials ?? 0;
            const views = form.views ?? 0;
            const rate = views > 0 ? (submissions / views) * 100 : 0;
            const rateLabel = views > 0 ? `${rate.toFixed(1)}%` : "—";
            const goodRate = rate >= 5;
            const parsedFields = parseFields(form.fields);

            return (
              <Link
                key={form.id}
                href={`/dashboard/forms/${form.id}`}
                className="group block bg-white border border-border rounded-2xl px-5 py-5 transition-all hover:border-neutral-300 hover:shadow-[0_2px_4px_rgba(15,15,15,0.04),0_12px_28px_-16px_rgba(15,15,15,0.12)] shadow-[0_1px_2px_rgba(15,15,15,0.04),0_4px_12px_-6px_rgba(15,15,15,0.06)]"
              >
                <div className="flex flex-col md:flex-row md:items-center md:gap-6">
                  {/* Left — preview thumbnail */}
                  <div className="w-[140px] h-[160px] shrink-0 mb-4 md:mb-0 bg-neutral-50 rounded-lg border border-border p-2 transition-colors group-hover:bg-white">
                    <FormThumbnail
                      name={form.name}
                      description={form.description}
                      fields={parsedFields as any}
                    />
                  </div>

                  {/* Middle — identity + stats stacked */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground text-lg tracking-tight truncate">
                        {form.name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${
                          form.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-neutral-100 text-muted-foreground border border-border"
                        }`}
                      >
                        {form.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono truncate mb-4">
                      /{form.slug}
                    </div>

                    <div className="grid grid-cols-3 gap-2 max-w-md">
                      <StatTile label="Views" value={formatStat(views)} />
                      <StatTile label="Submissions" value={formatStat(submissions)} />
                      <StatTile label="Rate" value={rateLabel} emphasize={goodRate} />
                    </div>
                  </div>

                  {/* Right — actions menu */}
                  <div className="md:shrink-0 mt-4 md:mt-0 md:self-start">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 border border-border text-muted-foreground hover:text-foreground hover:bg-neutral-100"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          aria-label="Form actions"
                        >
                          <Settings2 className="h-4 w-4" strokeWidth={1.75} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {form.name || "Form"}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/forms/${form.id}`}>
                            <Pencil className="h-3.5 w-3.5 " strokeWidth={1.75} />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {form.shareId && (
                          <DropdownMenuItem asChild>
                            <a
                              href={`/submit/${form.shareId}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink className="h-3.5 w-3.5 " strokeWidth={1.75} />
                              View public page
                            </a>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
