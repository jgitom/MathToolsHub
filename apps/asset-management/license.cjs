const crypto = require("node:crypto");

const PRODUCT = "mathtoolshub-asset-management";
const PUBLIC_KEY_SPKI_BASE64 = "MCowBQYDK2VwAyEAUg3789h4SCFybG7zOzllM9wOTV+IeBcnCLBLqKPt+Dg=";
const VALID_LIMITS = new Set([1000, 10000, 100000]);

function publicKeyFromBase64(value = PUBLIC_KEY_SPKI_BASE64) {
  return crypto.createPublicKey({ key: Buffer.from(value, "base64"), type: "spki", format: "der" });
}

function verifyLicense(document, publicKeyBase64 = PUBLIC_KEY_SPKI_BASE64) {
  if (!document || typeof document !== "object" || !document.payload || typeof document.signature !== "string") throw new Error("Invalid licence file.");
  const { payload } = document;
  if (payload.version !== 1 || payload.product !== PRODUCT || !VALID_LIMITS.has(payload.assetLimit) || typeof payload.purchaseId !== "string" || !/^cs_(test|live)_/.test(payload.purchaseId) || Number.isNaN(Date.parse(payload.issuedAt))) throw new Error("Invalid licence details.");
  const valid = crypto.verify(null, Buffer.from(JSON.stringify(payload), "utf8"), publicKeyFromBase64(publicKeyBase64), Buffer.from(document.signature, "base64"));
  if (!valid) throw new Error("The licence signature is invalid.");
  return Object.freeze({ valid: true, assetLimit: payload.assetLimit, purchaseId: payload.purchaseId, issuedAt: payload.issuedAt });
}

function enforceAssetLimit(store, licence) {
  const count = Array.isArray(store?.assets) ? store.assets.length : 0;
  if (!licence?.valid) throw new Error("Activate a valid Asset Management licence before saving assets.");
  if (count > licence.assetLimit) throw new Error(`This licence supports ${licence.assetLimit.toLocaleString()} assets. Delete ${count - licence.assetLimit} asset(s) or activate a larger licence.`);
  return count;
}

module.exports = { PRODUCT, PUBLIC_KEY_SPKI_BASE64, verifyLicense, enforceAssetLimit };
