(function () {
  const SUPABASE_URL = "https://cenayutywkiljwqyxfii.supabase.co";
  const PUBLISHABLE_KEY = "sb_publishable_yzzaOuTuhztpDyeRsx2BhA_maGOdj0W";
  const FALLBACK = Object.freeze({
    mode: "disabled",
    plans: Object.freeze([
      Object.freeze({ assetLimit: 1000, amount: 199, checkoutUrl: "" }),
      Object.freeze({ assetLimit: 10000, amount: 599, checkoutUrl: "" }),
      Object.freeze({ assetLimit: 100000, amount: 999, checkoutUrl: "" })
    ])
  });
  window.MATHTOOLSHUB_ASSET_PAYMENT = FALLBACK;

  fetch(SUPABASE_URL + "/functions/v1/asset-download", {
    method: "POST",
    headers: { apikey: PUBLISHABLE_KEY, "content-type": "application/json" },
    body: JSON.stringify({ platform: "config" })
  })
    .then(response => response.json())
    .then(config => {
      // Checkout disabled (default until ASSET_CHECKOUT_ENABLED=true) — keep plans but no URLs.
      if (!config || config.mode === "disabled" || !Array.isArray(config.plans) || !config.plans.length) {
        window.MATHTOOLSHUB_ASSET_PAYMENT = Object.freeze({ mode: "disabled", plans: FALLBACK.plans });
        document.dispatchEvent(new CustomEvent("asset-payment-ready"));
        return;
      }
      const merged = FALLBACK.plans.map(fallbackPlan => {
        const live = config.plans.find(plan => plan.assetLimit === fallbackPlan.assetLimit);
        return Object.freeze({ ...fallbackPlan, checkoutUrl: live?.checkoutUrl ?? fallbackPlan.checkoutUrl });
      });
      window.MATHTOOLSHUB_ASSET_PAYMENT = Object.freeze({ mode: "live", plans: Object.freeze(merged) });
      document.dispatchEvent(new CustomEvent("asset-payment-ready"));
    })
    .catch(() => { /* keep fallback; links stay hidden until live config is available */ });
})();
