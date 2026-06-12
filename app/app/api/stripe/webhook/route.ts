import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, planFromSubscription } from "@/lib/stripe";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook handler. Subscribed events:
 *   checkout.session.completed         → user just upgraded; sync customer + sub IDs + plan
 *   customer.subscription.updated      → renewal, plan change, status change
 *   customer.subscription.deleted      → canceled or unpaid → revert to FREE
 *
 * Idempotency: every handler is an upsert keyed on stable IDs, so reprocessing
 * the same Stripe event is safe.
 */
export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err: any) {
    return NextResponse.json(
      { error: "invalid_signature", message: err?.message ?? String(err) },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub);
        break;
      }
      default:
        // No-op for events we don't subscribe to.
        break;
    }
  } catch (err: any) {
    console.error("[stripe/webhook] handler error", {
      eventType: event.type,
      eventId: event.id,
      err: err?.message ?? String(err),
    });
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id;
  if (!userId) {
    console.warn("[stripe/webhook] checkout.session.completed without client_reference_id");
    return;
  }

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  const subId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!customerId || !subId) {
    console.warn("[stripe/webhook] checkout.session.completed missing IDs", {
      customerId,
      subId,
    });
    return;
  }

  const sub = await stripe.subscriptions.retrieve(subId);

  await db.user.update({
    where: { id: userId },
    data: {
      plan: planFromSubscription(sub),
      stripeCustomerId: customerId,
      stripeSubscriptionId: subId,
      currentPeriodEnd: subscriptionPeriodEnd(sub),
    },
  });
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const dbUser = await db.user.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });
  if (!dbUser) {
    console.warn("[stripe/webhook] subscription.updated for unknown customer", {
      customerId,
    });
    return;
  }

  await db.user.update({
    where: { id: dbUser.id },
    data: {
      plan: planFromSubscription(sub),
      stripeSubscriptionId: sub.id,
      currentPeriodEnd: subscriptionPeriodEnd(sub),
    },
  });
}

/**
 * Stripe API moved `current_period_end` off Subscription onto SubscriptionItem.
 * Read the earliest item period end (representative for a single-product sub).
 */
function subscriptionPeriodEnd(sub: Stripe.Subscription): Date | null {
  const ts = sub.items.data
    .map((i) => i.current_period_end)
    .filter((n): n is number => typeof n === "number" && n > 0)
    .sort()[0];
  return ts ? new Date(ts * 1000) : null;
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const dbUser = await db.user.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });
  if (!dbUser) return;

  await db.user.update({
    where: { id: dbUser.id },
    data: {
      plan: "FREE",
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
    },
  });
}
