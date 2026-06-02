"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, User, Building2, CreditCard } from "lucide-react";

export default function SettingsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [workspace, setWorkspace] = useState<any>(null);

  const [workspaceName, setWorkspaceName] = useState("");

  useEffect(() => {
    fetchWorkspace();
  }, []);

  const fetchWorkspace = async () => {
    try {
      const response = await fetch("/api/workspace");
      if (response.ok) {
        const data = await response.json();
        setWorkspace(data);
        setWorkspaceName(data.name);
      }
    } catch (error) {
      console.error("Error fetching workspace:", error);
    } finally {
      setWorkspaceLoading(false);
    }
  };

  const handleSaveWorkspace = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/workspace", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: workspaceName,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setWorkspace(updated);
        alert("Workspace updated successfully!");
      } else {
        alert("Failed to update workspace");
      }
    } catch (error) {
      console.error("Error updating workspace:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (workspaceLoading) {
    return (
      <div className="max-w-4xl">
        <div className="mb-8">
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-10 animate-slide-in-top space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Account</p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-[1.1]">
          Your <span className="font-serif italic text-primary">settings</span>.
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Manage your account, workspace, and billing.
        </p>
      </div>

      <div className="space-y-6 animate-stagger">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Account Information</CardTitle>
            </div>
            <CardDescription>Your personal account details from Clerk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={user?.firstName || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={user?.lastName || ""} disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                value={user?.emailAddresses[0]?.emailAddress || ""}
                disabled
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Account details are managed through Clerk. Click your profile picture to
              update your information.
            </p>
          </CardContent>
        </Card>

        {/* Workspace Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>Workspace Settings</CardTitle>
            </div>
            <CardDescription>Configure your workspace preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspaceName">Workspace Name</Label>
              <Input
                id="workspaceName"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="My Workspace"
              />
            </div>

            {workspace && (
              <div className="space-y-2">
                <Label>Workspace Slug</Label>
                <Input value={workspace.slug} disabled />
                <p className="text-xs text-muted-foreground">
                  This is your unique workspace identifier
                </p>
              </div>
            )}

            <div className="pt-4">
              <Button
                onClick={handleSaveWorkspace}
                disabled={loading || !workspaceName}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Plan & Billing */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle>Plan & Billing</CardTitle>
            </div>
            <CardDescription>Manage your subscription and usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/50">
              <div>
                <div className="font-semibold text-foreground mb-1">Free Plan</div>
                <div className="text-sm text-muted-foreground">
                  Unlimited testimonials and widgets
                </div>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>

            {workspace && (
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-4 border border-border rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {workspace._count?.testimonials || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Testimonials</div>
                </div>
                <div className="text-center p-4 border border-border rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {workspace._count?.widgets || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Widgets</div>
                </div>
                <div className="text-center p-4 border border-border rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {workspace._count?.forms || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Forms</div>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Billing features will be available in a future update.
            </p>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that affect your workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/5">
              <div>
                <div className="font-semibold text-foreground mb-1">
                  Delete Workspace
                </div>
                <div className="text-sm text-muted-foreground">
                  Permanently delete your workspace and all data
                </div>
              </div>
              <Button variant="destructive" disabled>
                Delete
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Workspace deletion will be available in a future update.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
