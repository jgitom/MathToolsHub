(function () {
  const SUPABASE_URL = "https://cenayutywkiljwqyxfii.supabase.co";
  const PUBLISHABLE_KEY = "sb_publishable_yzzaOuTuhztpDyeRsx2BhA_maGOdj0W";
  const FALLBACK = Object.freeze({
    mode: "disabled",
    product: "mathtoolshub-chronoconvert",
    plans: Object.freeze([
      Object.freeze({ edition: "Personal", amount: 499, checkoutUrl: "" }),
      Object.freeze({ edition: "Full Pack", amount: 999, checkoutUrl: "" })
    ])
  });
  window.MATHTOOLSHUB_CHRONOCONVERT_PAYMENT = FALLBACK;

  fetch(SUPABASE_URL + "/functions/v1/chronoconvert-download", {
    method: "POST",
    headers: { apikey: PUBLISHABLE_KEY, "content-type": "application/json" },
    body: JSON.stringify({ platform: "config" })
  })
    .then(response => response.json())
    .then(config => {
      // Checkout disabled (default until CHRONOCONVERT_CHECKOUT_ENABLED=true) — keep plans but no URLs.
      if (!config || config.mode === "disabled" || !Array.isArray(config.plans) || !config.plans.length) {
        window.MATHTOOLSHUB_CHRONOCONVERT_PAYMENT = Object.freeze({ mode: "disabled", product: "mathtoolshub-chronoconvert", plans: FALLBACK.plans });
        document.dispatchEvent(new CustomEvent("chronoconvert-payment-ready"));
        return;
      }
      const merged = FALLBACK.plans.map(fallbackPlan => {
        const live = config.plans.find(plan => plan.edition === fallbackPlan.edition);
        return Object.freeze({ ...fallbackPlan, checkoutUrl: live?.checkoutUrl ?? fallbackPlan.checkoutUrl });
      });
      window.MATHTOOLSHUB_CHRONOCONVERT_PAYMENT = Object.freeze({ mode: "live", product: "mathtoolshub-chronoconvert", plans: Object.freeze(merged) });
      document.dispatchEvent(new CustomEvent("chronoconvert-payment-ready"));
    })
    .catch(() => { /* keep fallback; links stay hidden until live config is available */ });
})();
