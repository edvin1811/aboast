import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder_set_env_var";

export const stripe = new Stripe(key, {
  appInfo: { name: "aboast", version: "1.0.0" },
});

export const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID;
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.aboast.com";

/**
 * Map a Stripe subscription's status to our internal plan tier.
 * - active or trialing  → PRO
 * - everything else     → FREE (canceled, past_due, unpaid, incomplete, paused)
 */
export function planFromSubscription(
  sub: Pick<Stripe.Subscription, "status">
): "FREE" | "PRO" {
  if (sub.status === "active" || sub.status === "trialing") return "PRO";
  return "FREE";
}
