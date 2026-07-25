# Stripe subscription setup

The complete, current implementation and activation procedure is in [`SUBSCRIPTION-LAUNCH.md`](SUBSCRIPTION-LAUNCH.md).

The public checkout configuration remains in `payment-config.js`. It contains only live Stripe Payment Links. Secret keys belong only in Supabase Edge Function secrets.

Implemented server components:

- `subscription.sql`: subscription state, entitlement RPC, webhook idempotency and private Storage policy
- `activity-entitlements-seed.sql`: explicit Free/Premium IDs
- `functions/stripe-webhook/index.ts`: checkout, renewal, failure and cancellation processing
- `functions/customer-portal/index.ts`: authenticated Stripe billing management

Do not launch from the Payment Links alone. Apply the SQL, deploy both functions, configure Customer Portal, and complete the test-mode lifecycle in `SUBSCRIPTION-LAUNCH.md` first.