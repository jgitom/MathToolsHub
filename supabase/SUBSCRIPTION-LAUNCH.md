# MathToolsHub subscription launch runbook

This repository now contains the customer-facing guard, explicit Free/Premium activity IDs, database schema, Stripe webhook, Customer Portal function and policy pages. Do not paste secret keys into GitHub or public website files.

## Important hosting boundary

GitHub Pages publishes every deployed HTML, JavaScript and asset as a public file. `subscription-access.js` provides a consistent access experience and checks the server-authoritative Supabase status, but it cannot make those published files secret. `premium-content` in Supabase Storage is server-protected by RLS and is suitable for PDFs/downloads.

Before claiming that interactive Premium games/programmes are securely protected, move their assets to an authenticated application host or private object store behind an application gateway. Until that migration is complete, treat the browser guard as a launch control, not DRM.

## 1. Review the commercial policy

`refund-policy.html` currently proposes:

- refund requests within 7 days of the first charge;
- renewal refund requests within 7 days, reviewed with usage;
- confirmed duplicate/incorrect charges corrected.

The owner must approve or revise this before deployment. Obtain appropriate legal review for Malaysian consumer/privacy requirements and services used by children.

## 2. Apply Supabase database changes

In Supabase Dashboard → SQL Editor, run these files in order:

1. `supabase/schema.sql` (skip if already applied)
2. `supabase/subscription.sql`
3. `supabase/activity-entitlements-seed.sql`

Confirm these tables exist with RLS enabled:

- `profiles`
- `subscriptions`
- `stripe_webhook_events`
- `activity_entitlements`

Confirm Storage contains a private `premium-content` bucket.

## 3. Deploy Edge Functions

Deploy the repository source:

- `supabase/functions/stripe-webhook/index.ts` with JWT verification OFF
- `supabase/functions/customer-portal/index.ts` with JWT verification ON

The matching settings are recorded in `supabase/config.toml`.

Set Edge Function secrets in Supabase:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SITE_URL=https://www.mathtoolshub.com`

`SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are normally injected by Supabase. Never expose the service-role key in browser code.

## 4. Configure Stripe events

The event destination must use:

`https://cenayutywkiljwqyxfii.supabase.co/functions/v1/stripe-webhook`

Subscribe to:

- `checkout.session.completed`
- `invoice.paid`
- `invoice.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Copy that destination’s signing secret into the Supabase `STRIPE_WEBHOOK_SECRET` secret. Test and live destinations have different secrets.

## 5. Configure Stripe Customer Portal

Stripe Dashboard → Settings → Billing → Customer portal:

- allow customers to update payment methods;
- allow cancellation at period end;
- show invoice history;
- do not allow switching to unrelated products;
- save the configuration.

The account page calls `customer-portal` and returns to `https://www.mathtoolshub.com/account.html`.

## 6. Complete lifecycle test in Stripe test mode

Do this before switching the Edge Function secrets to live mode.

1. Create or use test-mode monthly/yearly recurring prices matching MYR 7.90 and MYR 79.90.
2. Configure a test Payment Link and test event destination for the same webhook function.
3. Temporarily set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to the test-mode values.
4. Create a dedicated Supabase test user and sign in at `account.html?payment_preview=1`.
5. Open test checkout from that signed-in account so `client_reference_id` is the Supabase user UUID.
6. Pay with Stripe test card `4242 4242 4242 4242`, any future expiry and any CVC.
7. Verify Stripe shows successful `checkout.session.completed`, `customer.subscription.created` and `invoice.paid` deliveries with HTTP 200.
8. Verify Supabase `subscriptions` contains the test user, customer ID, subscription ID, `active`, correct plan and future period end.
9. Refresh the account page and verify Premium, plan, active status and renewal date.
10. Open a Premium activity and confirm it loads; sign out and confirm the lock appears.
11. Open Manage billing and choose cancellation at period end. Verify `customer.subscription.updated`, `cancel_at_period_end=true`, and account wording “Access until”.
12. Resume the subscription, then use a Stripe test clock or a second test subscription with a failing renewal payment to generate `invoice.payment_failed`. Verify status becomes `past_due` and Premium access is restricted.
13. Cancel the test subscription immediately. Verify `customer.subscription.deleted`, status `canceled`, and Free access.
14. Resend one processed webhook event. Verify the response reports `duplicate: true` and no duplicate subscription record is created.
15. Delete the Stripe test customer and Supabase test user after recording results.

Only after all 15 checks pass, restore live `STRIPE_SECRET_KEY` and the live destination’s `STRIPE_WEBHOOK_SECRET`, redeploy, and send one live destination test event.

## 7. Repository preflight

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\validate-subscription-launch.ps1
```

Expected result: 138 activities, 25 Free, 113 Premium, 142 guarded pages, all lifecycle handlers present, and no committed Stripe secrets.