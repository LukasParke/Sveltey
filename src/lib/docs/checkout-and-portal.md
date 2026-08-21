---
title: Checkout & Portal
description: How checkout sessions and the customer portal are created, and how users move between them.
section: payments
---

## Checkout

The pricing page posts a plain form — no JavaScript required:

```html
<form method="POST" action="/api/stripe/checkout">
	<input type="hidden" name="plan" value="pro" />
	<button type="submit">Subscribe to Pro</button>
</form>
```

The endpoint (`src/routes/api/stripe/checkout/+server.ts`) then:

1. Validates the plan against `plans.ts` (free plans never reach Stripe)
2. Requires a session — anonymous users redirect to
   `/auth/register?next=/pricing`
3. Resolves the Stripe customer: reuses the stored `stripe_customer_id`, or
   creates one with the user's email + `user_id` metadata
4. Creates a **subscription-mode Checkout Session** with
   `client_reference_id = user.id` and plan metadata on both session and
   subscription, so the webhook can attribute it later
5. Redirects (303) to `session.url` — Stripe's hosted payment page

Success returns to `/app/dashboard/billing?checkout=success`; cancel returns
to `/pricing?checkout=cancelled`.

## Price resolution

For each plan the endpoint checks `getPriceIdForPlan(plan.id)`:

- Set (`STRIPE_PRICE_PRO`) → uses that existing Stripe Price
- Unset → builds inline `price_data` from `plans.ts` amounts, creating the
  price on the fly. This is why the template works before you create anything
  in the Stripe dashboard.

## Customer portal

The billing page's _Manage Billing in Stripe_ button POSTs to
`/api/stripe/portal`, which:

1. Requires a session (redirects to login with `next` otherwise)
2. Resolves or lazily creates the customer (same lookup as checkout)
3. Creates a **Customer Portal Session** with
   `return_url = {origin}/app/dashboard/billing`

Users can update cards, download invoices, switch plans, and cancel there.
One-time setup: activate the portal in Stripe → Settings → Billing →
**Customer portal**.

## After checkout

On return, the billing page reads its subscription row and shows a success
banner with a refresh action. The authoritative state arrives asynchronously
when Stripe delivers `checkout.session.completed` — see
[Webhooks](/docs/webhooks).
