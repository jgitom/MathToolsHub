(function () {
  const SUPABASE_URL = "https://cenayutywkiljwqyxfii.supabase.co";
  const PUBLISHABLE_KEY = "sb_publishable_yzzaOuTuhztpDyeRsx2BhA_maGOdj0W";
  const FALLBACK = Object.freeze({
    mode: "live",
    product: "mathtoolshub-sme-pos",
    plans: Object.freeze([
      Object.freeze({ itemLimit: 5000, amount: 199, checkoutUrl: "" }),
      Object.freeze({ itemLimit: 10000, amount: 299, checkoutUrl: "" }),
      Object.freeze({ itemLimit: 50000, amount: 599, checkoutUrl: "" }),
      Object.freeze({ itemLimit: 100000, amount: 799, checkoutUrl: "" })
    ])
  });
  window.MATHTOOLSHUB_SME_POS_PAYMENT = FALLBACK;

  fetch(SUPABASE_URL + "/functions/v1/sme-pos-download", {
    method: "POST",
    headers: { apikey: PUBLISHABLE_KEY, "content-type": "application/json" },
    body: JSON.stringify({ platform: "config" })
  })
    .then(response => response.json())
    .then(config => {
      if (!config || !Array.isArray(config.plans)) return;
      const merged = FALLBACK.plans.map(fallbackPlan => {
        const live = config.plans.find(plan => plan.itemLimit === fallbackPlan.itemLimit);
        return Object.freeze({ ...fallbackPlan, checkoutUrl: live?.checkoutUrl ?? fallbackPlan.checkoutUrl });
      });
      window.MATHTOOLSHUB_SME_POS_PAYMENT = Object.freeze({ mode: "live", product: "mathtoolshub-sme-pos", plans: Object.freeze(merged) });
      document.dispatchEvent(new CustomEvent("sme-pos-payment-ready"));
    })
    .catch(() => { /* keep fallback; links stay hidden until live config is available */ });
})();