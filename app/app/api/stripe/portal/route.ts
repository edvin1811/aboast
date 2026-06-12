import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { stripe, APP_URL } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/**
 * Creates a Stripe Billing Portal session for the current user's subscription.
 * Used by the "Manage subscription" / cancel button on /dashboard/billing.
 */
export async function POST() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
    select: { stripeCustomerId: true },
  });

  if (!dbUser?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No Stripe customer record — upgrade first" },
      { status: 400 }
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: `${APP_URL}/dashboard/billing`,
  });

  return NextResponse.json({ url: session.url });
}
