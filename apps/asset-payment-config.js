window.MATHTOOLSHUB_ASSET_PAYMENT = Object.freeze({
  mode: "live",
  plans: Object.freeze([
    Object.freeze({ assetLimit: 1000, amount: 199, checkoutUrl: "https://buy.stripe.com/REPLACE_1000" }),
    Object.freeze({ assetLimit: 10000, amount: 599, checkoutUrl: "https://buy.stripe.com/REPLACE_10000" }),
    Object.freeze({ assetLimit: 100000, amount: 999, checkoutUrl: "https://buy.stripe.com/REPLACE_100000" })
  ])
});
