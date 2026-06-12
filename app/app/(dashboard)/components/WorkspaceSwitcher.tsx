"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, Plus, Check, Lock } from "lucide-react";
import { useWorkspace } from "./WorkspaceProvider";
import { useUserPlan, isAtQuota } from "@/lib/use-user-plan";
import {
  useUpgradeDialog,
  handleQuotaResponse,
} from "@/lib/use-upgrade-dialog";

export function WorkspaceSwitcher() {
  const router = useRouter();
  const { currentWorkspace, workspaces, setCurrentWorkspace, setWorkspaces, loading } = useWorkspace();
  const { data: planData, refresh: refreshPlan } = useUserPlan();
  const { showUpgrade } = useUpgradeDialog();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [creating, setCreating] = useState(false);

  const atWorkspaceQuota = isAtQuota(planData, "workspaces");

  const openCreateWorkspace = () => {
    if (atWorkspaceQuota && planData) {
      showUpgrade({
        kind: "quota_reached",
        resource: "workspace",
        current: planData.usage.workspaces,
        limit: planData.limits.workspaces,
      });
      return;
    }
    setIsCreateDialogOpen(true);
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;

    setCreating(true);
    try {
      const slug = newWorkspaceName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newWorkspaceName,
          slug: slug || `workspace-${Date.now()}`,
        }),
      });

      // Server-side quota check (in case the client state was stale).
      if (await handleQuotaResponse(response, showUpgrade)) {
        setIsCreateDialogOpen(false);
        setNewWorkspaceName("");
        return;
      }

      if (response.ok) {
        const newWorkspace = await response.json();
        console.log("New workspace created:", newWorkspace);
        setWorkspaces([...workspaces, newWorkspace]);
        setNewWorkspaceName("");
        setIsCreateDialogOpen(false);
        await refreshPlan();

        // Switch to the new workspace (this will reload the page)
        await setCurrentWorkspace(newWorkspace);
      } else {
        const error = await response.json();
        console.error("Failed to create workspace:", error);
        alert("Failed to create workspace: " + (error.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
      alert("Failed to create workspace");
    } finally {
      setCreating(false);
    }
  };

  const handleSwitchWorkspace = async (workspace: typeof currentWorkspace) => {
    if (workspace) {
      await setCurrentWorkspace(workspace);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="h-9 w-9 rounded-lg bg-primary-soft animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
          <div className="h-2 w-16 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between h-auto p-2.5 hover:bg-neutral-100 rounded-xl"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-primary-soft border border-primary/30 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                {currentWorkspace?.name.charAt(0).toUpperCase() || "W"}
              </div>
              <div className="text-left min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">
                  {currentWorkspace?.name || "No Workspace"}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => handleSwitchWorkspace(workspace)}
              className="flex items-center gap-2"
            >
              <div className="h-8 w-8 rounded-lg bg-primary-soft border border-primary/30 flex items-center justify-center text-primary font-semibold text-xs flex-shrink-0">
                {workspace.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{workspace.name}</div>
                <div className="text-xs text-muted-foreground truncate">/{workspace.slug}</div>
              </div>
              {currentWorkspace?.id === workspace.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={openCreateWorkspace}
            className={atWorkspaceQuota ? "text-muted-foreground" : "text-primary"}
          >
            {atWorkspaceQuota ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                <span className="flex-1">Create Workspace</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-primary-soft text-primary px-1.5 py-0.5 rounded-md">
                  Pro
                </span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Workspace
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Workspace Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Create a new workspace for a separate business or project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                placeholder="My Business"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateWorkspace()}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                This will be used to identify your workspace.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setNewWorkspaceName("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateWorkspace} disabled={!newWorkspaceName.trim() || creating}>
              {creating ? "Creating..." : "Create Workspace"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
