"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton } from "@/components/CopyButton";
import { Share2, Code, Link as LinkIcon } from "lucide-react";

interface ShareDialogProps {
  type: "widget" | "form";
  shareId: string;
  name: string;
}

export function ShareDialog({ type, shareId, name }: ShareDialogProps) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = type === "widget"
    ? `${baseUrl}/widget/${shareId}`
    : `${baseUrl}/submit/${shareId}`;

  const embedCode = `<iframe src="${publicUrl}" width="100%" height="600" frameborder="0" style="border-radius: 8px;"></iframe>`;
  const scriptEmbed = `<script src="${publicUrl}/embed.js" data-widget="${shareId}"></script>`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share {name}</DialogTitle>
          <DialogDescription>
            {type === "widget"
              ? "Embed this widget on your website or share the direct link"
              : "Share this form to collect testimonials from your customers"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link">
              <LinkIcon className="h-4 w-4 mr-2" />
              Direct Link
            </TabsTrigger>
            {type === "widget" && (
              <>
                <TabsTrigger value="iframe">
                  <Code className="h-4 w-4 mr-2" />
                  iFrame
                </TabsTrigger>
                <TabsTrigger value="script">
                  <Code className="h-4 w-4 mr-2" />
                  Script
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <div className="space-y-2">
              <Label>Public URL</Label>
              <div className="flex gap-2">
                <Input value={publicUrl} readOnly className="flex-1" />
                <CopyButton text={publicUrl} label="Copy URL" />
              </div>
              <p className="text-xs text-muted-foreground">
                {type === "widget"
                  ? "Share this link to show your testimonials"
                  : "Share this link with customers to collect testimonials"}
              </p>
            </div>
          </TabsContent>

          {type === "widget" && (
            <>
              <TabsContent value="iframe" className="space-y-4">
                <div className="space-y-2">
                  <Label>iFrame Embed Code</Label>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto border border-border">
                      <code>{embedCode}</code>
                    </pre>
                    <div className="absolute top-2 right-2">
                      <CopyButton text={embedCode} label="Copy Code" variant="ghost" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paste this code into your website's HTML where you want the widget to appear
                  </p>
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Preview</h4>
                  <div className="bg-background border border-border rounded-lg overflow-hidden">
                    <iframe
                      src={publicUrl}
                      width="100%"
                      height="300"
                      style={{ border: "none", borderRadius: "8px" }}
                      title={`Preview of ${name}`}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="script" className="space-y-4">
                <div className="space-y-2">
                  <Label>Script Embed (Coming Soon)</Label>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto border border-border opacity-50">
                      <code>{scriptEmbed}</code>
                    </pre>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dynamic script embedding is coming in a future update
                  </p>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
