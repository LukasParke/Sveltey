---
title: Customizing Plans
description: Add, rename, reprice, or remove subscription plans from a single config file.
section: payments
---

## The registry

`src/lib/config/plans.ts` is the single source of truth:

```ts
export const plans: Plan[] = [
	{
		id: 'pro',
		name: 'Pro',
		description: 'Best for growing businesses and teams',
		priceCents: 1900, // $19.00 / month
		features: [
			{ name: 'Unlimited projects', included: true },
			{ name: 'Team collaboration', included: false }
		],
		popular: true
	}
];
```

Everything downstream reads this file: the pricing page cards, checkout line
items, the webhook's price→plan mapping, and dashboard badges.

## Two ways to price

**Inline (zero setup).** Leave `STRIPE_PRICE_*` unset and checkout builds
Stripe prices on the fly via `price_data` using each plan's `priceCents`.
Great for development and demos.

**Stripe Price IDs (recommended in production).** Create Products/Prices in
the Stripe dashboard, then set environment variables:

```env
STRIPE_PRICE_PRO="price_..."
STRIPE_PRICE_ENTERPRISE="price_..."
```

With IDs set, checkout uses them and the webhook maps `price_id` back to
`plan_id` automatically — so subscription rows stay meaningful even when users
change plans inside the portal.

<Callout kind="info" title="Adding a plan">
    Append an entry to <code>plans</code>, optionally add
    <code>STRIPE_PRICE_YOURPLAN</code>, and add a matching case to
    <code>resolvePlanId()</code> in the webhook. Pricing UI updates itself.
</Callout>

## Changing billing intervals

Plans are monthly by default. For annual pricing, either create annual Prices
in Stripe and pass those IDs, or extend the `Plan` interface with a second
amount and a billing-period toggle on the pricing page — checkout's
`price_data.recurring.interval` accepts `'month' | 'year'`.

## Free tier semantics

A plan with `priceCents: 0` never reaches Stripe. The starter plan is treated
as the implicit default: users without an active subscription row are on it,
shown as such across the dashboard, billing page, and pricing.
