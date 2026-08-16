// Browser-safe payment configuration for the SME POS System.
// Checkout URLs are served from Supabase Edge Function secrets at runtime.
window.MATHTOOLSHUB_SME_POS_PAYMENT = Object.freeze({
  mode: "live",
  product: "mathtoolshub-sme-pos",
  plans: Object.freeze([
    Object.freeze({ itemLimit: 5000, amount: 199 }),
    Object.freeze({ itemLimit: 10000, amount: 299 }),
    Object.freeze({ itemLimit: 50000, amount: 599 }),
    Object.freeze({ itemLimit: 100000, amount: 799 })
  ])
});