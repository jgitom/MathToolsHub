import Stripe from "npm:stripe@22.0.0";

const allowedOrigins = new Set(["https://mathtoolshub.com", "https://www.mathtoolshub.com", "http://127.0.0.1:8000", "http://localhost:8000"]);
const cors = (request: Request) => ({ "access-control-allow-origin": allowedOrigins.has(request.headers.get("origin") ?? "") ? request.headers.get("origin")! : "https://mathtoolshub.com", "access-control-allow-headers": "apikey, content-type", "access-control-allow-methods": "POST, OPTIONS", "vary": "Origin" });
const respond = (request: Request, body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors(request), "content-type": "application/json", "cache-control": "private, no-store" } });
const plans = new Map([
  [19900, { assetLimit: 1000, productName: "Asset Management — 1,000 Assets" }],
  [59900, { assetLimit: 10000, productName: "Asset Management — 10,000 Assets" }],
  [99900, { assetLimit: 100000, productName: "Asset Management — 100,000 Assets" }],
]);
const bytesFromBase64 = (value: string) => Uint8Array.from(atob(value), character => character.charCodeAt(0));
const base64FromBytes = (value: ArrayBuffer) => {
  const bytes = new Uint8Array(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

async function createLicense(sessionId: string, assetLimit: number) {
  const privateKey = Deno.env.get("ASSET_LICENSE_PRIVATE_KEY") ?? "";
  if (!privateKey) throw new Error("Licence signing is not configured");
  const payload = {
    version: 1,
    product: "mathtoolshub-asset-management",
    assetLimit,
    purchaseId: sessionId,
    issuedAt: new Date().toISOString(),
  };
  const key = await crypto.subtle.importKey("pkcs8", bytesFromBase64(privateKey), { name: "Ed25519" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("Ed25519", key, new TextEncoder().encode(JSON.stringify(payload)));
  return { payload, signature: base64FromBytes(signature) };
}

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors(request) });
  if (request.method !== "POST") return respond(request, { error: "Method not allowed" }, 405);
  const stripeKey = Deno.env.get("STRIPE_ASSET_LIVE_SECRET_KEY") ?? "";
  if (!stripeKey) return respond(request, { error: "Download verification is not configured" }, 503);
  let input: { sessionId?: string; platform?: string };
  try { input = await request.json(); } catch { return respond(request, { error: "Invalid request" }, 400); }
  if (!/^cs_(test|live)_[A-Za-z0-9_]+$/.test(input.sessionId ?? "")) return respond(request, { error: "Invalid Checkout Session" }, 400);
  if (input.platform !== "windows" && input.platform !== "verify") return respond(request, { error: "This platform installer is not available yet" }, 404);
  try {
    const stripe = new Stripe(stripeKey, { httpClient: Stripe.createFetchHttpClient() });
    const session = await stripe.checkout.sessions.retrieve(input.sessionId!, { expand: ["line_items.data.price.product"] });
    const plan = plans.get(session.amount_total ?? 0);
    const product = session.line_items?.data[0]?.price?.product;
    const productName = typeof product === "object" && product && "name" in product ? product.name : "";
    const isValid = session.currency === "myr" && session.payment_status === "paid" && session.mode === "payment" && session.livemode && Boolean(session.payment_link) && session.line_items?.data.length === 1 && productName === plan?.productName;
    if (!plan || !isValid) return respond(request, { error: "A completed Asset Management payment was not found" }, 403);
    if (input.platform === "verify") return respond(request, { assetLimit: plan.assetLimit });
    const downloadUrl = new URL("https://mathtoolshub-asset-download.mathtoolshub-jgitom.workers.dev/download");
    downloadUrl.searchParams.set("session_id", input.sessionId!);
    return respond(request, { assetLimit: plan.assetLimit, downloadUrl: downloadUrl.toString(), license: await createLicense(session.id, plan.assetLimit) });
  } catch (error) {
    console.error("Asset download verification failed", error);
    return respond(request, { error: "Unable to verify this payment" }, 502);
  }
});
