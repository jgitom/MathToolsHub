import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const manifestUrl = new URL("activity-entitlements.json", import.meta.url);
const accountUrl = new URL("account.html", import.meta.url);
const launchAt = new Date("2026-08-15T00:00:00+08:00");
const config = window.MATHTOOLSHUB_SUPABASE;
const launched = new Date() >= launchAt || new URLSearchParams(location.search).get("subscription_preview") === "1";

const normalisePath = value => {
  const url = new URL(value, location.origin);
  let path = url.pathname.replace(/\/index\.html$/i, "/");
  if (!/\.[a-z0-9]+$/i.test(path) && !path.endsWith("/")) path += "/";
  return path;
};

const style = document.createElement("style");
style.textContent = `
  .mth-tier-badge{display:inline-flex;align-items:center;margin-left:.55rem;padding:.2rem .48rem;border-radius:999px;background:#fef3c7;color:#92400e;font:800 10px/1.2 system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase;vertical-align:middle}
  .mth-subscription-lock{position:fixed;inset:0;z-index:2147483645;display:grid;place-items:center;padding:18px;background:rgba(2,6,23,.88);backdrop-filter:blur(8px)}
  .mth-subscription-dialog{width:min(520px,100%);padding:28px;border:1px solid #bfdbfe;border-radius:20px;background:#fff;color:#172033;box-shadow:0 28px 80px #0008;font-family:Inter,"Segoe UI",Arial,sans-serif;text-align:center}
  .mth-subscription-dialog h1{margin:0 0 12px;color:#0f2747;font-size:clamp(1.65rem,6vw,2.35rem)}
  .mth-subscription-dialog p{color:#526077;line-height:1.65}.mth-subscription-actions{display:grid;gap:10px;margin-top:20px}
  .mth-subscription-actions a{display:grid;place-items:center;min-height:46px;padding:10px 14px;border-radius:10px;text-decoration:none;font-weight:850}
  .mth-subscription-primary{color:#fff;background:#2563eb}.mth-subscription-secondary{color:#172033;background:#e8eef7}
`;
document.head.appendChild(style);

async function loadManifest() {
  const response = await fetch(manifestUrl, { cache: "no-cache" });
  if (!response.ok) throw new Error(`Entitlement manifest failed: ${response.status}`);
  return response.json();
}

function matchActivity(manifest, value) {
  const path = normalisePath(value);
  return manifest.activities.find(item => normalisePath(item.path) === path) ||
    manifest.activities.filter(item => path.startsWith(normalisePath(item.path))).sort((a,b) => b.path.length-a.path.length)[0] || null;
}

async function getAccess() {
  if (!config?.url || !config?.publishableKey) return { access_tier: "free", status: "configuration_error" };
  const client = window.mathToolsHubSupabase || createClient(config.url, config.publishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  window.mathToolsHubSupabase = client;
  const { data: { session } } = await client.auth.getSession();
  if (!session) return { access_tier: "free", status: "signed_out" };
  const { data, error } = await client.rpc("get_my_subscription");
  if (error) return { access_tier: "free", status: "unavailable", session, error };
  return { ...(Array.isArray(data) ? data[0] : data), session };
}

function showLock(activity, access) {
  if (document.querySelector(".mth-subscription-lock")) return;
  const returnPath = `${location.pathname}${location.search}${location.hash}`;
  const signIn = new URL(accountUrl);
  signIn.searchParams.set("return", returnPath);
  const overlay = document.createElement("section");
  overlay.className = "mth-subscription-lock";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.innerHTML = `<div class="mth-subscription-dialog"><div class="mth-tier-badge">Premium</div><h1>Premium activity</h1><p><strong>${activity.title}</strong> is included with MathToolsHub Premium. Sign in to check your access or subscribe from MYR 7.90 per month.</p><div class="mth-subscription-actions"><a class="mth-subscription-primary" href="${signIn.href}">${access.status === "signed_out" ? "Sign in or create account" : "View subscription options"}</a><a class="mth-subscription-secondary" href="${new URL("index.html", accountUrl).href}">Return to homepage</a></div></div>`;
  document.body.appendChild(overlay);
  overlay.querySelector("a")?.focus();
}

function labelCatalogueLinks(manifest, access) {
  let premiumLinkCount = 0;
  document.querySelectorAll("a[href]").forEach(link => {
    const activity = matchActivity(manifest, link.href);
    if (!activity || activity.access_tier !== "premium") return;
    premiumLinkCount += 1;
    link.dataset.accessTier = "premium";
    const heading = link.querySelector("h2,h3,strong");
    if (heading && !heading.querySelector(".mth-tier-badge")) heading.insertAdjacentHTML("beforeend", '<span class="mth-tier-badge">Premium</span>');
    if (access.access_tier !== "premium" && link.dataset.subscriptionBound !== "true") {
      link.dataset.subscriptionBound = "true";
      link.addEventListener("click", event => {
        if (!launched) return;
        event.preventDefault();
        showLock(activity, access);
      });
    }
  });
  document.documentElement.dataset.subscriptionPremiumLinks = String(premiumLinkCount);
}

try {
  const manifest = await loadManifest();
  const access = launched ? await getAccess() : { access_tier: "premium", status: "promotion" };
  document.documentElement.dataset.subscriptionAccess = access.access_tier || "free";
  labelCatalogueLinks(manifest, access);
  let relabelTimer;
  const catalogueObserver = new MutationObserver(() => {
    clearTimeout(relabelTimer);
    relabelTimer = setTimeout(() => labelCatalogueLinks(manifest, access), 50);
  });
  catalogueObserver.observe(document.body, { childList: true, subtree: true });
  const current = matchActivity(manifest, location.href);
  if (launched && current?.access_tier === "premium" && access.access_tier !== "premium") showLock(current, access);
  document.dispatchEvent(new CustomEvent("mathToolsHubSubscriptionReady", { detail: { activity: current, access } }));
} catch (error) {
  console.error("MathToolsHub subscription guard could not initialise.", error);
}