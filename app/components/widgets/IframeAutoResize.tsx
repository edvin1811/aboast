"use client";

import { useEffect } from "react";

/**
 * Iframes have no native auto-size. When a widget is embedded via our
 * loader script, the parent page listens for `aboast:height` postMessages
 * from this iframe and resizes accordingly.
 *
 * Emits on mount, on `resize`, and whenever the document height changes
 * (ResizeObserver on <html>). Idempotent — sends the same value
 * repeatedly is fine; the loader script de-dupes.
 */
export function IframeAutoResize({ shareId }: { shareId: string }) {
  useEffect(() => {
    if (typeof window === "undefined" || window.parent === window) {
      // Not in an iframe — nothing to resize.
      return;
    }

    let lastHeight = -1;
    const send = () => {
      const height = Math.ceil(
        Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight
        )
      );
      if (height === lastHeight) return;
      lastHeight = height;
      try {
        window.parent.postMessage(
          { type: "aboast:height", shareId, height },
          "*"
        );
      } catch {
        /* parent may be on a cross-origin page without a port we can post to;
           silently skip — loader will fall back to its default height */
      }
    };

    send();
    const ro = new ResizeObserver(send);
    ro.observe(document.documentElement);
    window.addEventListener("resize", send);
    // Send once more after first paint settles
    const t = window.setTimeout(send, 150);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", send);
      window.clearTimeout(t);
    };
  }, [shareId]);

  return null;
}
