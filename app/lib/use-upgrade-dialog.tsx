"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { QuotaResource, ProFeature } from "@/lib/plans";

export type UpgradeKind = "quota_reached" | "premium_feature";
export type UpgradeResource = QuotaResource | ProFeature;

export type UpgradeState = {
  kind: UpgradeKind;
  resource: UpgradeResource;
  current?: number;
  limit?: number;
  customMessage?: string;
};

type Ctx = {
  state: (UpgradeState & { open: boolean }) | null;
  showUpgrade: (s: UpgradeState) => void;
  closeUpgrade: () => void;
};

const UpgradeDialogContext = createContext<Ctx>({
  state: null,
  showUpgrade: () => {},
  closeUpgrade: () => {},
});

export function UpgradeDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<(UpgradeState & { open: boolean }) | null>(
    null
  );

  const showUpgrade = useCallback((s: UpgradeState) => {
    setState({ ...s, open: true });
  }, []);
  const closeUpgrade = useCallback(() => {
    setState((prev) => (prev ? { ...prev, open: false } : prev));
  }, []);

  const value = useMemo(
    () => ({ state, showUpgrade, closeUpgrade }),
    [state, showUpgrade, closeUpgrade]
  );

  return (
    <UpgradeDialogContext.Provider value={value}>
      {children}
    </UpgradeDialogContext.Provider>
  );
}

export function useUpgradeDialog() {
  return useContext(UpgradeDialogContext);
}

/**
 * Helper for clients calling mutation endpoints. If the response is a 409
 * quota_reached, opens the dialog and returns true (caller should bail).
 * Returns false if the response is fine and the caller should continue.
 */
export async function handleQuotaResponse(
  res: Response,
  showUpgrade: (s: UpgradeState) => void
): Promise<boolean> {
  if (res.status !== 409) return false;
  try {
    const body = await res.clone().json();
    if (body?.error === "quota_reached") {
      showUpgrade({
        kind: "quota_reached",
        resource: body.resource,
        current: body.current,
        limit: body.limit,
      });
      return true;
    }
  } catch {
    /* not JSON — fall through */
  }
  return false;
}
