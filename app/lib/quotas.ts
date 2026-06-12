import { db } from "@/lib/db";
import { limitsFor, type QuotaResource } from "@/lib/plans";

export class QuotaError extends Error {
  resource: QuotaResource;
  current: number;
  limit: number;
  plan: "FREE" | "PRO";

  constructor(args: {
    resource: QuotaResource;
    current: number;
    limit: number;
    plan: "FREE" | "PRO";
  }) {
    super(`quota_reached:${args.resource}`);
    this.name = "QuotaError";
    this.resource = args.resource;
    this.current = args.current;
    this.limit = args.limit;
    this.plan = args.plan;
  }

  toResponseBody() {
    return {
      error: "quota_reached" as const,
      resource: this.resource,
      current: this.current,
      limit: this.limit,
      plan: this.plan,
    };
  }
}

async function userPlan(userId: string) {
  const u = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: { plan: true },
  });
  return u.plan;
}

async function workspaceOwnerPlan(workspaceId: string) {
  const w = await db.workspace.findUniqueOrThrow({
    where: { id: workspaceId },
    select: { userId: true, user: { select: { plan: true } } },
  });
  return { userId: w.userId, plan: w.user.plan };
}

export async function assertCanCreateWorkspace(userId: string): Promise<void> {
  const plan = await userPlan(userId);
  const limit = limitsFor(plan).workspaces;
  if (!Number.isFinite(limit)) return;
  const current = await db.workspace.count({ where: { userId } });
  if (current >= limit) {
    throw new QuotaError({ resource: "workspace", current, limit, plan });
  }
}

export async function assertCanCreateForm(workspaceId: string): Promise<void> {
  const { plan } = await workspaceOwnerPlan(workspaceId);
  const limit = limitsFor(plan).forms;
  if (!Number.isFinite(limit)) return;
  const current = await db.form.count({ where: { workspaceId } });
  if (current >= limit) {
    throw new QuotaError({ resource: "form", current, limit, plan });
  }
}

export async function assertCanCreateWidget(workspaceId: string): Promise<void> {
  const { plan } = await workspaceOwnerPlan(workspaceId);
  const limit = limitsFor(plan).widgets;
  if (!Number.isFinite(limit)) return;
  const current = await db.widget.count({ where: { workspaceId } });
  if (current >= limit) {
    throw new QuotaError({ resource: "widget", current, limit, plan });
  }
}

export async function assertCanCreateWall(workspaceId: string): Promise<void> {
  const { plan } = await workspaceOwnerPlan(workspaceId);
  const limit = limitsFor(plan).walls;
  if (!Number.isFinite(limit)) return;
  const current = await db.wallOfLove.count({ where: { workspaceId } });
  if (current >= limit) {
    throw new QuotaError({ resource: "wall", current, limit, plan });
  }
}

export async function assertCanCreateTestimonial(workspaceId: string): Promise<void> {
  const { plan } = await workspaceOwnerPlan(workspaceId);
  const limit = limitsFor(plan).testimonials;
  if (!Number.isFinite(limit)) return;
  const current = await db.testimonial.count({ where: { workspaceId } });
  if (current >= limit) {
    throw new QuotaError({ resource: "testimonial", current, limit, plan });
  }
}

/**
 * Preflight check for bulk-import — call with the number of rows the importer
 * intends to insert. Throws if the resulting total would exceed the limit.
 *
 * On QuotaError the dialog can render: "Importing N would put you at (current+N)/limit"
 */
export async function assertCanImportTestimonials(
  workspaceId: string,
  count: number
): Promise<void> {
  const { plan } = await workspaceOwnerPlan(workspaceId);
  const limit = limitsFor(plan).testimonials;
  if (!Number.isFinite(limit)) return;
  const current = await db.testimonial.count({ where: { workspaceId } });
  if (current + count > limit) {
    throw new QuotaError({
      resource: "import",
      current: current + count,
      limit,
      plan,
    });
  }
}
