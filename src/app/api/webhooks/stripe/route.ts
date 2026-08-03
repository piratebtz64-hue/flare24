import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

async function setGoldByUserId(userId: string, isGold: boolean) {
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({ is_gold: isGold, updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (error) console.error("[Stripe→Gold] profile update", error.message);
    else console.log("[Stripe→Gold]", userId, isGold);
  } catch (e) {
    console.error("[Stripe→Gold] admin client", e);
  }
}

async function setGoldByEmail(email: string, isGold: boolean) {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
    if (error) {
      console.error("[Stripe→Gold] listUsers", error.message);
      return;
    }
    const user = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (!user) {
      console.warn("[Stripe→Gold] no user for email", email);
      return;
    }
    await setGoldByUserId(user.id, isGold);
  } catch (e) {
    console.error("[Stripe→Gold] by email", e);
  }
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(secret, {
    apiVersion: "2025-02-24.acacia",
  });

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const email =
        session.customer_details?.email || session.customer_email || undefined;

      if (userId) await setGoldByUserId(userId, true);
      else if (email) await setGoldByEmail(email, true);

      console.log("[Stripe] checkout.session.completed", session.id);
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id;
      const active = ["active", "trialing"].includes(sub.status);
      if (userId) await setGoldByUserId(userId, active);
      console.log("[Stripe] subscription.updated", sub.id, sub.status);
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id;
      if (userId) await setGoldByUserId(userId, false);
      console.log("[Stripe] subscription.deleted", sub.id);
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("[Stripe] payment failed", invoice.id);
      break;
    }
    default:
      console.log("[Stripe] unhandled", event.type);
  }

  return NextResponse.json({ received: true });
}
