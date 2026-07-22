# Stripe subscription launch

The public checkout configuration is stored in `payment-config.js`. It contains only a Stripe Payment Link and must never contain a Stripe secret key.

## Before 1 August 2026

1. In Stripe, create and verify the production subscription Payment Link.
2. Replace the test URL in `payment-config.js` with the live URL and change `mode` from `test` to `live`.
3. Configure Stripe to collect the customer's email and send successful-payment receipts.
4. Configure an authenticated Stripe webhook or Supabase Edge Function for `checkout.session.completed`, `invoice.paid`, and subscription cancellation events.
5. Store `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` only as Supabase project secrets, never in this repository.
6. On successful payment, match the verified Stripe customer email to the Supabase profile and update `content_access_until` using a privileged server-side function.

The public Payment Link alone collects payment but does not securely grant account access. Browser code must not update subscription entitlements.

## Preview

Add `?payment_preview=1` to the homepage or account page URL to preview the post-launch payment controls before the scheduled date. Test mode remains visibly labelled and cannot collect real money.
