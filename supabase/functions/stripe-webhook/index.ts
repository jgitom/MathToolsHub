import Stripe from "npm:stripe@^22";
import { createClient } from "npm:@supabase/supabase-js@^2";

const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const stripe = new Stripe(stripeSecret, { httpClient: Stripe.createFetchHttpClient() });
const cryptoProvider = Stripe.createSubtleCryptoProvider();
const db = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const asId = (value: string | { id: string } | null | undefined) => typeof value === "string" ? value : value?.id ?? null;
const toIso = (seconds: number | null | undefined) => seconds ? new Date(seconds * 1000).toISOString() : null;
const subscriptionEnd = (subscription: Stripe.Subscription) => {
  const direct = (subscription as unknown as { current_period_end?: number }).current_period_end;
  const itemEnds = subscription.items?.data?.map(item => (item as unknown as { current_period_end?: number }).current_period_end ?? 0) ?? [];
  return direct || Math.max(0, ...itemEnds) || null;
};
const planFrom = (subscription: Stripe.Subscription) => {
  const interval = subscription.items?.data?.[0]?.price?.recurring?.interval;
  return interval === "year" ? "yearly" : interval === "month" ? "monthly" : null;
};

async function resolveUserId(customerId: string | null, suppliedUserId?: string | null) {
  if (suppliedUserId && /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(suppliedUserId)) return suppliedUserId;
  if (!customerId) return null;
  const { data } = await db.from("subscriptions").select("user_id").eq("stripe_customer_id", customerId).maybeSingle();
  if (data?.user_id) return data.user_id as string;
  const { data: profile } = await db.from("profiles").select("id").eq("stripe_customer_id", customerId).maybeSingle();
  return profile?.id as string | null;
}

async function syncSubscription(subscription: Stripe.Subscription, eventCreated: number, suppliedUserId?: string | null) {
  const customerId = asId(subscription.customer);
  const userId = await resolveUserId(customerId, suppliedUserId);
  if (!userId || !customerId) throw new Error(`Unable to match subscription ${subscription.id} to a Supabase user`);
  const eventCreatedIso = toIso(eventCreated)!;
  const { data: existing } = await db.from("subscriptions").select("last_stripe_event_created").eq("user_id", userId).maybeSingle();
  if (existing?.last_stripe_event_created && new Date(existing.last_stripe_event_created) > new Date(eventCreatedIso)) return { userId, ignored: "older_event" };
  const periodEnd = subscriptionEnd(subscription);
  const record = {
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: subscription.items?.data?.[0]?.price?.id ?? null,
    plan_id: planFrom(subscription),
    status: subscription.status,
    current_period_end: toIso(periodEnd),
    cancel_at_period_end: subscription.cancel_at_period_end ?? false,
    canceled_at: toIso(subscription.canceled_at),
    last_stripe_event_created: eventCreatedIso,
    updated_at: new Date().toISOString()
  };
  const { error } = await db.from("subscriptions").upsert(record, { onConflict: "user_id" });
  if (error) throw error;
  const activeUntil = ["active", "trialing"].includes(subscription.status) && periodEnd ? toIso(periodEnd) : new Date().toISOString();
  const { error: profileError } = await db.from("profiles").update({ stripe_customer_id: customerId, content_access_until: activeUntil, updated_at: new Date().toISOString() }).eq("id", userId);
  if (profileError) throw profileError;
  return { userId, status: subscription.status, currentPeriodEnd: activeUntil };
}

async function retrieveSubscription(id: string | null) {
  if (!id) throw new Error("Stripe event did not contain a subscription ID");
  return stripe.subscriptions.retrieve(id, { expand: ["items.data.price"] });
}

Deno.serve(async request => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!stripeSecret || !webhookSecret || !supabaseUrl || !serviceRoleKey) return json({ error: "Webhook is not configured" }, 500);
  const signature = request.headers.get("stripe-signature");
  if (!signature) return json({ error: "Missing Stripe signature" }, 400);
  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret, undefined, cryptoProvider);
  } catch (error) {
    return json({ error: "Invalid signature", detail: error instanceof Error ? error.message : String(error) }, 401);
  }
  const { data: duplicate } = await db.from("stripe_webhook_events").select("event_id").eq("event_id", event.id).maybeSingle();
  if (duplicate) return json({ received: true, duplicate: true });
  try {
    let outcome: unknown = { ignored: true };
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscription = await retrieveSubscription(asId(session.subscription));
      outcome = await syncSubscription(subscription, event.created, session.client_reference_id);
    } else if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      const legacyId = asId((invoice as unknown as { subscription?: string | Stripe.Subscription }).subscription);
      const parentId = asId((invoice as unknown as { parent?: { subscription_details?: { subscription?: string | Stripe.Subscription } } }).parent?.subscription_details?.subscription);
      outcome = await syncSubscription(await retrieveSubscription(legacyId || parentId), event.created);
    } else if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) {
      outcome = await syncSubscription(event.data.object as Stripe.Subscription, event.created);
    }
    const { error: logError } = await db.from("stripe_webhook_events").insert({ event_id: event.id, event_type: event.type, event_created: toIso(event.created), outcome: "processed", detail: outcome });
    if (logError && logError.code !== "23505") throw logError;
    return json({ received: true, type: event.type, outcome });
  } catch (error) {
    console.error("Stripe webhook processing failed", event.id, error);
    return json({ error: "Webhook processing failed", event_id: event.id, detail: error instanceof Error ? error.message : String(error) }, 500);
  }
});