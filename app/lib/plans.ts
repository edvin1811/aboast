import type { Plan } from "@prisma/client";

/**
 * Plan tier limits. `Infinity` = unlimited.
 *
 * Limits scope:
 *   - workspaces   = per user (a Free user can own at most 1 workspace; Pro can own 3)
 *   - others       = per workspace (so a Pro user with 3 workspaces gets unlimited within each)
 *   - brandingRequired = when true, the public submit/wall pages always render the "Powered by aboast"
 *     watermark and the in-editor toggle to hide it triggers the upgrade dialog.
 */
export const PLAN_LIMITS = {
  FREE: {
    workspaces: 1,
    forms: 3,
    widgets: 3,
    walls: 3,
    testimonials: 10,
    brandingRequired: true,
    canExport: false,
    canVideo: false,
    canCustomDomain: false,
    canVanitySlug: false,
  },
  PRO: {
    workspaces: 3,
    forms: Infinity,
    widgets: Infinity,
    walls: Infinity,
    testimonials: Infinity,
    brandingRequired: false,
    canExport: true,
    canVideo: true,
    canCustomDomain: true,
    canVanitySlug: true,
  },
} as const satisfies Record<Plan, PlanLimits>;

export type PlanLimits = {
  workspaces: number;
  forms: number;
  widgets: number;
  walls: number;
  testimonials: number;
  brandingRequired: boolean;
  canExport: boolean;
  canVideo: boolean;
  canCustomDomain: boolean;
  canVanitySlug: boolean;
};

export function limitsFor(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
}

/** Used by the upgrade dialog and the public marketing pricing card. */
export const PRO_PRICE_USD = 19;

/** Pro feature names — used as the `resource` discriminator on the upgrade dialog. */
export const PRO_FEATURES = [
  "branding",
  "video",
  "export",
  "custom_domain",
  "vanity_slug",
] as const;
export type ProFeature = (typeof PRO_FEATURES)[number];

/** Quota-bound resource names — used as the `resource` discriminator on the upgrade dialog. */
export const QUOTA_RESOURCES = [
  "workspace",
  "form",
  "widget",
  "wall",
  "testimonial",
  "import",
] as const;
export type QuotaResource = (typeof QUOTA_RESOURCES)[number];
