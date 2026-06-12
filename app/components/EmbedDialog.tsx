"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy, Code2 } from "lucide-react";

/**
 * Shared embed-code dialog for widgets + forms.
 *
 * Two tabs:
 *   - Recommended (script loader, auto-resizes iframe via postMessage)
 *   - Raw iframe (advanced, fixed-height)
 *
 * `kind` decides which surface we point at:
 *   - "widget"    → /widget/[shareId]/embed.js + /widget/[shareId]
 *   - "form"      → /submit/[shareId] (no loader yet; raw iframe only)
 *   - "wall"      → /wall/[shareId] (raw iframe only)
 */
export function EmbedDialog({
  open,
  onOpenChange,
  shareId,
  kind,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareId: string;
  kind: "widget" | "form" | "wall";
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://app.aboast.com";

  const pageUrl =
    kind === "widget"
      ? `${origin}/widget/${shareId}`
      : kind === "wall"
        ? `${origin}/wall/${shareId}`
        : `${origin}/submit/${shareId}`;

  const scriptSnippet =
    kind === "widget"
      ? `<script async src="${origin}/widget/${shareId}/embed.js"></script>`
      : null;

  const iframeSnippet = `<iframe
  src="${pageUrl}"
  style="width:100%;min-height:600px;border:0"
  frameborder="0"
  scrolling="no"
  title="Aboast ${kind}"
></iframe>`;

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" strokeWidth={1.75} />
            Embed this {kind}
          </DialogTitle>
          <DialogDescription>
            Paste one of these snippets into the HTML of your site —
            anywhere you want the {kind} to appear.
          </DialogDescription>
        </DialogHeader>

        {scriptSnippet ? (
          <Tabs defaultValue="script" className="mt-2">
            <TabsList>
              <TabsTrigger value="script">Recommended</TabsTrigger>
              <TabsTrigger value="iframe">Raw iframe</TabsTrigger>
            </TabsList>

            <TabsContent value="script" className="space-y-3">
              <p className="text-sm text-muted-foreground">
                A single script tag that drops in an auto-resizing iframe.
                Best for most sites — no need to guess a height.
              </p>
              <SnippetBlock
                code={scriptSnippet}
                copied={copied === "script"}
                onCopy={() => copy(scriptSnippet, "script")}
              />
            </TabsContent>

            <TabsContent value="iframe" className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Bare iframe with a fixed minimum height. Use this if your
                CMS blocks &lt;script&gt; tags or you want full control over
                the iframe attributes.
              </p>
              <SnippetBlock
                code={iframeSnippet}
                copied={copied === "iframe"}
                onCopy={() => copy(iframeSnippet, "iframe")}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-3 mt-2">
            <p className="text-sm text-muted-foreground">
              Drop this iframe wherever you want the {kind} to appear on
              your site.
            </p>
            <SnippetBlock
              code={iframeSnippet}
              copied={copied === "iframe-only"}
              onCopy={() => copy(iframeSnippet, "iframe-only")}
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Public URL:{" "}
            <a
              href={pageUrl}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-foreground hover:text-primary underline-offset-2 hover:underline"
            >
              {pageUrl}
            </a>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SnippetBlock({
  code,
  copied,
  onCopy,
}: {
  code: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="relative bg-neutral-900 text-neutral-100 rounded-xl p-4 pr-14 font-mono text-xs leading-relaxed overflow-x-auto">
      <pre className="whitespace-pre-wrap break-all">{code}</pre>
      <button
        onClick={onCopy}
        className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xs font-medium transition-colors"
        type="button"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-300" strokeWidth={2.25} />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
            Copy
          </>
        )}
      </button>
    </div>
  );
}
