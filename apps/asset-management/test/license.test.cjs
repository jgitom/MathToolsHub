const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { PRODUCT, verifyLicense, enforceAssetLimit } = require("../license.cjs");

const keys = crypto.generateKeyPairSync("ed25519");
const publicKey = keys.publicKey.export({ type: "spki", format: "der" }).toString("base64");
const makeLicense = assetLimit => {
  const payload = { version: 1, product: PRODUCT, assetLimit, purchaseId: "cs_test_boundary", issuedAt: "2026-08-16T00:00:00.000Z" };
  return { payload, signature: crypto.sign(null, Buffer.from(JSON.stringify(payload)), keys.privateKey).toString("base64") };
};
const storeWith = count => ({ version: 1, assets: Array.from({ length: count }, (_, index) => ({ id: String(index) })) });

for (const limit of [1000, 10000, 100000]) {
  test(`${limit.toLocaleString()} licence accepts its boundary and blocks one extra asset`, () => {
    const licence = verifyLicense(makeLicense(limit), publicKey);
    assert.equal(enforceAssetLimit(storeWith(limit), licence), limit);
    assert.throws(() => enforceAssetLimit(storeWith(limit + 1), licence), new RegExp(`${limit.toLocaleString()} assets`));
  });
}

test("missing licence blocks saving", () => {
  assert.throws(() => enforceAssetLimit(storeWith(1), { valid: false }), /Activate a valid/);
});

test("tampered tier is rejected", () => {
  const document = makeLicense(1000);
  document.payload.assetLimit = 100000;
  assert.throws(() => verifyLicense(document, publicKey), /signature is invalid/);
});

test("wrong product is rejected even with a valid signature", () => {
  const document = makeLicense(1000);
  document.payload.product = "another-product";
  document.signature = crypto.sign(null, Buffer.from(JSON.stringify(document.payload)), keys.privateKey).toString("base64");
  assert.throws(() => verifyLicense(document, publicKey), /Invalid licence details/);
});
