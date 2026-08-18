(function () {
  const SUPABASE_URL = "https://cenayutywkiljwqyxfii.supabase.co";
  const PUBLISHABLE_KEY = "sb_publishable_yzzaOuTuhztpDyeRsx2BhA_maGOdj0W";
  const FALLBACK = Object.freeze({
    mode: "disabled",
    product: "mathtoolshub-nexoffice",
    plans: Object.freeze([
      Object.freeze({ edition: "Personal", amount: 19900, checkoutUrl: "" }),
      Object.freeze({ edition: "Professional", amount: 39900, checkoutUrl: "" }),
      Object.freeze({ edition: "Business", amount: 79900, checkoutUrl: "" })
    ])
  });
  window.MATHTOOLSHUB_NEXOFFICE_PAYMENT = FALLBACK;

  fetch(SUPABASE_URL + "/functions/v1/nexoffice-download", {
    method: "POST",
    headers: { apikey: PUBLISHABLE_KEY, "content-type": "application/json" },
    body: JSON.stringify({ platform: "config" })
  })
    .then(response => response.json())
    .then(config => {
      // Checkout disabled (default until NEXOFFICE_CHECKOUT_ENABLED=true) — keep plans but no URLs.
      if (!config || config.mode === "disabled" || !Array.isArray(config.plans) || !config.plans.length) {
        window.MATHTOOLSHUB_NEXOFFICE_PAYMENT = Object.freeze({ mode: "disabled", product: "mathtoolshub-nexoffice", plans: FALLBACK.plans });
        document.dispatchEvent(new CustomEvent("nexoffice-payment-ready"));
        return;
      }
      const merged = FALLBACK.plans.map(fallbackPlan => {
        const live = config.plans.find(plan => plan.tier === fallbackPlan.edition);
        return Object.freeze({ ...fallbackPlan, checkoutUrl: live?.checkoutUrl ?? fallbackPlan.checkoutUrl });
      });
      window.MATHTOOLSHUB_NEXOFFICE_PAYMENT = Object.freeze({ mode: "live", product: "mathtoolshub-nexoffice", plans: Object.freeze(merged) });
      document.dispatchEvent(new CustomEvent("nexoffice-payment-ready"));
    })
    .catch(() => { /* keep fallback; links stay hidden until live config is available */ });
})();
