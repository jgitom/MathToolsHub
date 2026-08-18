import Stripe from "npm:stripe@22.0.0";

const allowedOrigins = new Set(["https://mathtoolshub.com", "https://www.mathtoolshub.com", "http://127.0.0.1:8000", "http://localhost:8000"]);
const cors = (request: Request) => ({ "access-control-allow-origin": allowedOrigins.has(request.headers.get("origin") ?? "") ? request.headers.get("origin")! : "https://mathtoolshub.com", "access-control-allow-headers": "apikey, content-type", "access-control-allow-methods": "POST, OPTIONS", "vary": "Origin" });
const respond = (request: Request, body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors(request), "content-type": "application/json", "cache-control": "private, no-store" } });
const plans = new Map([
  [19900, { tier: "Starter", productName: "NexCompany — Starter" }],
  [39900, { tier: "Standard", productName: "NexCompany — Standard" }],
  [89900, { tier: "Business", productName: "NexCompany — Business" }],
]);
// Live Payment Link URLs are stored in Supabase secrets named after each tier.
const paymentLinkSecret = (tier: string) => `NexCompany — ${tier}`;
const livePaymentLink = (tier: string) => Deno.env.get(paymentLinkSecret(tier)) ?? "";

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors(request) });
  if (request.method !== "POST") return respond(request, { error: "Method not allowed" }, 405);
  let input: { sessionId?: string; platform?: string };
  try { input = await request.json(); } catch { return respond(request, { error: "Invalid request" }, 400); }

  // Live checkout configuration, served to the download page from tier secrets.
  // Checkout is OFF by default — set the secret NEXCOMPANY_CHECKOUT_ENABLED=true to switch it on.
  if (input.platform === "config") {
    if (Deno.env.get("NEXCOMPANY_CHECKOUT_ENABLED") !== "true") return respond(request, { mode: "disabled", plans: [] });
    const checkoutUrls = [...plans.values()].map(plan => ({ tier: plan.tier, checkoutUrl: livePaymentLink(plan.tier) })).filter(item => item.checkoutUrl);
    if (!checkoutUrls.length) return respond(request, { mode: "disabled", plans: [] });
    return respond(request, { mode: "live", plans: checkoutUrls });
  }

  // Prefer a dedicated live secret key when provided; otherwise use the project
  // Stripe secret (test key) so the flow can be validated end-to-end in test mode.
  const stripeKey = Deno.env.get("STRIPE_NEXCOMPANY_LIVE_SECRET_KEY") ?? Deno.env.get("STRIPE_SECRET_KEY") ?? "";
  if (!stripeKey) return respond(request, { error: "Download verification is not configured" }, 503);
  if (!/^cs_(test|live)_[A-Za-z0-9_]+$/.test(input.sessionId ?? "")) return respond(request, { error: "Invalid Checkout Session" }, 400);
  if (input.platform !== "windows") return respond(request, { error: "This platform installer is not available yet" }, 404);
  try {
    const stripe = new Stripe(stripeKey, { httpClient: Stripe.createFetchHttpClient() });
    const session = await stripe.checkout.sessions.retrieve(input.sessionId!, { expand: ["line_items.data.price.product", "payment_link"] });
    const plan = plans.get(session.amount_total ?? 0);
    const product = session.line_items?.data[0]?.price?.product;
    const productName = typeof product === "object" && product && "name" in product ? product.name : "";
    const expectedLink = plan ? livePaymentLink(plan.tier) : "";
    const sessionLink = typeof session.payment_link === "object" && session.payment_link && "url" in session.payment_link ? session.payment_link.url : "";
    const usingLiveKey = stripeKey.startsWith("sk_live_");
    const isValid = session.currency === "myr" && session.payment_status === "paid" && session.mode === "payment" && session.livemode === usingLiveKey && Boolean(session.payment_link) && session.line_items?.data.length === 1 && productName === plan?.productName && (!expectedLink || sessionLink === expectedLink);
    if (!plan || !isValid) return respond(request, { error: "A completed NexCompany payment was not found" }, 403);
    return respond(request, { tier: plan.tier });
  } catch (error) {
    console.error("NexCompany download verification failed", error);
    return respond(request, { error: "Unable to verify this payment" }, 502);
  }
});
