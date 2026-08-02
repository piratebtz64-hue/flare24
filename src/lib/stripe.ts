import Stripe from "stripe";

export const FLARE24_GOLD_PRICE_ID = "price_1TzoHtCv958zyEcwhnLfsIrW";
export const FLARE24_GOLD_PRODUCT_ID = "prod_UzmW9bUsQNIazk";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(key, {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
  });
}

export async function createCheckoutSession({
  customerId,
  userId,
  successUrl,
  cancelUrl,
}: {
  customerId?: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const stripe = getStripe();
  return stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    customer_creation: customerId ? undefined : "always",
    line_items: [{ price: FLARE24_GOLD_PRICE_ID, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      trial_settings: {
        end_behavior: { missing_payment_method: "cancel" },
      },
      metadata: { user_id: userId },
    },
    metadata: { user_id: userId },
    allow_promotion_codes: false,
    billing_address_collection: "auto",
  });
}

export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const stripe = getStripe();
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export async function createIdentityVerificationSession({
  userId,
  returnUrl,
}: {
  userId: string;
  returnUrl: string;
}) {
  const stripe = getStripe();
  return stripe.identity.verificationSessions.create({
    type: "document",
    metadata: { user_id: userId },
    options: {
      document: {
        require_matching_selfie: true,
        require_live_capture: true,
        allowed_types: ["passport", "driving_license", "id_card"],
      },
    },
    return_url: returnUrl,
  });
}
