---
title: Overview
description: Native Stripe subscriptions — what exists, how it connects, and what runs where.
section: payments
---

<script>
    import Callout from '$lib/components/docs/Callout.svelte';
</script>

## The pieces

| Piece         | Location                         | Role                                           |
| ------------- | -------------------------------- | ---------------------------------------------- |
| Plan registry | `src/lib/config/plans.ts`        | Single source of truth for plans and pricing   |
| Checkout      | `src/routes/api/stripe/checkout` | Creates Checkout Sessions, redirects to Stripe |
| Portal        | `src/routes/api/stripe/portal`   | Opens the Customer Portal for self-service     |
| Webhook       | `src/routes/api/stripe/webhook`  | Verifies signatures, mirrors state to Postgres |
| Billing UI    | `/app/dashboard/billing`         | Shows status; buttons hit the two endpoints    |

## The flow

```
Pricing ── POST /api/stripe/checkout ──▶ Stripe Checkout (hosted)
    ▲                                           │ payment
    │                                           ▼
/app/dashboard/billing ◀── webhook writes ── public.subscriptions
    │                                        (service role, RLS bypassed)
    └── POST /api/stripe/portal ──▶ Stripe Customer Portal
```

## Design decisions

**Plain Stripe, no wrapper.** The integration uses `stripe-node` and
`stripe-js` primitives directly — Checkout Sessions, Portal Sessions, webhook
`constructEventAsync`. No third-party billing layer to fight when requirements
change.

**State is mirrored, not proxied.** Subscription status lives in your own
`subscriptions` table (written by the webhook), so pages render from Postgres
without calling Stripe on every request.

**Graceful when unconfigured.** Without `STRIPE_SECRET_KEY` the pricing page
renders a setup banner and checkout stays disabled — the template boots and
demos cleanly before you add keys.

## What runs where

- **Browser**: pricing buttons (plain form POST), billing page (reads your
  subscription via RLS-protected select)
- **Server (anon key)**: checkout/portal endpoints read the user's customer
  mapping and create Stripe objects
- **Server (service role)**: the webhook writes subscription rows, bypassing
  RLS — the only writer of truth for subscription state
