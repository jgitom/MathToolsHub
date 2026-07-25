import Stripe from "npm:stripe@^22";
import { createClient } from "npm:@supabase/supabase-js@^2";

const allowedOrigins = new Set(["https://www.mathtoolshub.com", "https://mathtoolshub.com", "http://127.0.0.1:8000", "http://localhost:8000"]);
const originFor = (request: Request) => allowedOrigins.has(request.headers.get("origin") ?? "") ? request.headers.get("origin")! : "https://www.mathtoolshub.com";
const cors = (request: Request) => ({ "access-control-allow-origin": originFor(request), "access-control-allow-headers": "authorization, apikey, content-type", "access-control-allow-methods": "POST, OPTIONS", "vary": "Origin" });
const respond = (request: Request, body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors(request), "content-type": "application/json" } });

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors(request) });
  if (request.method !== "POST") return respond(request, { error: "Method not allowed" }, 405);
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return respond(request, { error: "Authentication required" }, 401);
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
  if (!supabaseUrl || !anonKey || !serviceKey || !stripeKey) return respond(request, { error: "Portal is not configured" }, 500);
  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return respond(request, { error: "Invalid session" }, 401);
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data: subscription, error } = await admin.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
  if (error) return respond(request, { error: "Unable to read subscription" }, 500);
  if (!subscription?.stripe_customer_id) return respond(request, { error: "No Stripe subscription is linked to this account" }, 404);
  try {
    const stripe = new Stripe(stripeKey, { httpClient: Stripe.createFetchHttpClient() });
    const siteUrl = (Deno.env.get("SITE_URL") || "https://www.mathtoolshub.com").replace(/\/$/, "");
    const session = await stripe.billingPortal.sessions.create({ customer: subscription.stripe_customer_id, return_url: `${siteUrl}/account.html` });
    return respond(request, { url: session.url });
  } catch (portalError) {
    console.error("Customer Portal creation failed", portalError);
    return respond(request, { error: "Unable to open billing management" }, 500);
  }
});