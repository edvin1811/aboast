"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { PLAN_LIMITS, type PlanLimits as PlanLimitsShape } from "@/lib/plans";

export type UserPlanState = {
  plan: "FREE" | "PRO";
  currentPeriodEnd: string | null;
  hasStripeCustomer: boolean;
  limits: PlanLimitsShape;
  usage: {
    workspaces: number;
    forms: number;
    widgets: number;
    walls: number;
    testimonials: number;
  };
  workspaceId: string | null;
};

type Ctx = {
  data: UserPlanState | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const UserPlanContext = createContext<Ctx>({
  data: null,
  isLoading: true,
  refresh: async () => {},
});

const FALLBACK: UserPlanState = {
  plan: "FREE",
  currentPeriodEnd: null,
  hasStripeCustomer: false,
  limits: PLAN_LIMITS.FREE,
  usage: { workspaces: 0, forms: 0, widgets: 0, walls: 0, testimonials: 0 },
  workspaceId: null,
};

export function UserPlanProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<UserPlanState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/user/me", { cache: "no-store" });
      if (!res.ok) {
        setData(FALLBACK);
        return;
      }
      const json = await res.json();
      // Server returns `Infinity` as `null`-ish through JSON. Hydrate it.
      const limits = json.limits as Record<string, unknown>;
      for (const key of ["workspaces", "forms", "widgets", "walls", "testimonials"]) {
        if (limits[key] === null) limits[key] = Infinity;
      }
      setData({
        plan: json.plan,
        currentPeriodEnd: json.currentPeriodEnd,
        hasStripeCustomer: json.hasStripeCustomer,
        limits: json.limits,
        usage: json.usage,
        workspaceId: json.workspaceId,
      });
    } catch {
      setData(FALLBACK);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <UserPlanContext.Provider value={{ data, isLoading, refresh }}>
      {children}
    </UserPlanContext.Provider>
  );
}

export function useUserPlan() {
  return useContext(UserPlanContext);
}

export function isAtQuota(
  data: UserPlanState | null,
  resource: keyof UserPlanState["usage"]
) {
  if (!data) return false;
  const limit = data.limits[resource];
  if (!Number.isFinite(limit)) return false;
  return data.usage[resource] >= (limit as number);
}

export function quotaUsageRatio(
  data: UserPlanState | null,
  resource: keyof UserPlanState["usage"]
) {
  if (!data) return 0;
  const limit = data.limits[resource];
  if (!Number.isFinite(limit) || limit === 0) return 0;
  return data.usage[resource] / (limit as number);
}
