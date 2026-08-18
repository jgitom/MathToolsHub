(function () {
  const SUPABASE_URL = "https://cenayutywkiljwqyxfii.supabase.co";
  const PUBLISHABLE_KEY = "sb_publishable_yzzaOuTuhztpDyeRsx2BhA_maGOdj0W";
  const FALLBACK = Object.freeze({
    mode: "disabled",
    product: "mathtoolshub-nexcompany",
    plans: Object.freeze([
      Object.freeze({ edition: "Starter", amount: 39900, checkoutUrl: "" }),
      Object.freeze({ edition: "Standard", amount: 59900, checkoutUrl: "" }),
      Object.freeze({ edition: "Business", amount: 109900, checkoutUrl: "" })
    ])
  });
  window.MATHTOOLSHUB_NEXCOMPANY_PAYMENT = FALLBACK;

  fetch(SUPABASE_URL + "/functions/v1/nexcompany-download", {
    method: "POST",
    headers: { apikey: PUBLISHABLE_KEY, "content-type": "application/json" },
    body: JSON.stringify({ platform: "config" })
  })
    .then(response => response.json())
    .then(config => {
      // Checkout disabled (default until NEXCOMPANY_CHECKOUT_ENABLED=true) — keep plans but no URLs.
      if (!config || config.mode === "disabled" || !Array.isArray(config.plans) || !config.plans.length) {
        window.MATHTOOLSHUB_NEXCOMPANY_PAYMENT = Object.freeze({ mode: "disabled", product: "mathtoolshub-nexcompany", plans: FALLBACK.plans });
        document.dispatchEvent(new CustomEvent("nexcompany-payment-ready"));
        return;
      }
      const merged = FALLBACK.plans.map(fallbackPlan => {
        const live = config.plans.find(plan => plan.tier === fallbackPlan.edition);
        return Object.freeze({ ...fallbackPlan, checkoutUrl: live?.checkoutUrl ?? fallbackPlan.checkoutUrl });
      });
      window.MATHTOOLSHUB_NEXCOMPANY_PAYMENT = Object.freeze({ mode: "live", product: "mathtoolshub-nexcompany", plans: Object.freeze(merged) });
      document.dispatchEvent(new CustomEvent("nexcompany-payment-ready"));
    })
    .catch(() => { /* keep fallback; links stay hidden until live config is available */ });
})();
