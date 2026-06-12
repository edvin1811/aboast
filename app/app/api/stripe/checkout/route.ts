import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { stripe, PRO_PRICE_ID, APP_URL } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/**
 * Creates a Stripe Checkout Session in subscription mode for the Pro tier.
 * Returns { url } — the caller does `window.location = url`.
 *
 * client_reference_id is the internal user.id so the webhook can map the
 * resulting subscription back to the right user row.
 */
export async function POST() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!PRO_PRICE_ID) {
    return NextResponse.json(
      { error: "Stripe is not configured (missing STRIPE_PRO_PRICE_ID)" },
      { status: 500 }
    );
  }

  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true, email: true, stripeCustomerId: true, plan: true },
  });
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (dbUser.plan === "PRO") {
    // Already on Pro — bounce them to the billing page instead of starting
    // a new checkout.
    return NextResponse.json({ url: `${APP_URL}/dashboard/billing` });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
    client_reference_id: dbUser.id,
    customer: dbUser.stripeCustomerId ?? undefined,
    customer_email: dbUser.stripeCustomerId ? undefined : dbUser.email,
    success_url: `${APP_URL}/dashboard/billing?upgrade=success`,
    cancel_url: `${APP_URL}/dashboard/billing?upgrade=cancel`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { userId: dbUser.id },
    },
  });

  return NextResponse.json({ url: session.url });
}
