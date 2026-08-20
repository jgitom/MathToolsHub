// MathToolsHub subscription guard - FREE MODE
// The Premium subscription paywall has been cancelled (2026-08-21).
// All premium content is now freely available to everyone - no sign-in and
// no subscription required. Official availability date: 22 August 2026.
const launchAt = new Date("2026-08-22T00:00:00+08:00");
const config = window.MATHTOOLSHUB_SUPABASE;
const launched = new Date() >= launchAt || new URLSearchParams(location.search).get("subscription_preview") === "1";

try {
  document.documentElement.dataset.subscriptionAccess = "free";
  document.documentElement.dataset.subscriptionPremiumLinks = "0";
  document.dispatchEvent(new CustomEvent("mathToolsHubSubscriptionReady", {
    detail: { activity: null, access: { access_tier: "free", status: "open" } }
  }));
} catch (error) {
  console.error("MathToolsHub subscription guard could not initialise.", error);
}