---
title: Webhooks
description: Signature-verified webhook handling that mirrors Stripe subscription state into Postgres.
section: payments
---

<script>
    import Callout from '$lib/components/docs/Callout.svelte';
</script>

## The endpoint

`POST /api/stripe/webhook` (`src/routes/api/stripe/webhook/+server.ts`):

1. Reads the **raw request body** (`arrayBuffer`) — never a parsed body, or
   signature verification fails
2. Verifies with `stripe.webhooks.constructEventAsync(body, signature, secret)`
3. Dispatches on event type, then mirrors the subscription into
   `public.subscriptions` via the **service-role** client (RLS bypassed)
4. Acknowledges with `{ received: true }`; handler failures return 500 so
   Stripe retries

Handled events: `checkout.session.completed`,
`customer.subscription.created`, `customer.subscription.updated`,
`customer.subscription.deleted`. Everything else is acknowledged and ignored.

## User resolution

The webhook must map a Stripe subscription back to your user. It tries, in
order:

1. `client_reference_id` (checkout sets this to `user.id`)
2. `subscription.metadata.user_id` (checkout sets this too)
3. The stored `stripe_customer_id → user_id` mapping in `subscriptions`

## The subscriptions table

```sql
create table public.subscriptions (
	user_id uuid not null unique references auth.users (id),
	stripe_customer_id text,
	stripe_subscription_id text,
	status text,
	price_id text,
	plan_id text,
	current_period_end timestamptz,
	cancel_at_period_end boolean,
	...
);
```

One row per user (`unique`), upserted on `user_id` by the webhook. RLS lets
users read their own row; all writes come from the service role.

## Local development

```bash
stripe listen --forward-to localhost:5173/api/stripe/webhook
```

Copy the printed `whsec_…` into `STRIPE_WEBHOOK_SECRET`. Trigger events with
`stripe trigger checkout.session.completed` or by completing a test checkout.

<Callout kind="warning" title="Do not parse the body before verification">
    Any middleware that consumes or re-serializes the request body breaks
    signature verification. The endpoint reads <code>arrayBuffer</code> and
    passes it straight to Stripe.
</Callout>

## Production

Stripe → Developers → Webhooks → **Add endpoint**:
`https://yourdomain.com/api/stripe/webhook`, subscribed to the four events
above. Set the signing secret as `STRIPE_WEBHOOK_SECRET` in your host.
