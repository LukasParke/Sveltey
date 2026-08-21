# Stripe Payments Setup

Sveltey integrates Stripe **natively** (no billing wrapper): Stripe Checkout for
subscriptions, the Stripe Customer Portal for self-service management, and a
signed webhook that mirrors subscription state into Postgres.

## 1. Stripe account & keys

1. Create a [Stripe](https://dashboard.stripe.com/register) account.
2. Copy your **Secret key** from <https://dashboard.stripe.com/apikeys>.
3. Add to `.env`:

```env
STRIPE_SECRET_KEY="sk_test_..."
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
```

`SUPABASE_SERVICE_ROLE_KEY` (Supabase → Project Settings → API) is required so
webhooks can write subscription rows despite RLS.

## 2. Database

Apply the migration that creates the `public.subscriptions` table with RLS:

- Supabase dashboard → SQL Editor → paste `supabase/migrations/0001_subscriptions.sql` → Run.
- Or `supabase db push` if you use the Supabase CLI.

## 3. Pricing plans

Plans are defined in `src/lib/config/plans.ts`. Two ways to price them:

- **Inline (zero setup):** leave `STRIPE_PRICE_*` unset. Checkout creates the
  price on the fly from the plan's `priceCents` using `price_data`.
- **Stripe Price IDs (recommended for production):** create Products/Prices in
  the Stripe dashboard, then set:

```env
STRIPE_PRICE_PRO="price_..."
STRIPE_PRICE_ENTERPRISE="price_..."
```

With Price IDs set, the webhook maps them back to `plan_id` automatically.

## 4. Webhook

1. Install the Stripe CLI: <https://docs.stripe.com/stripe-cli>
2. Forward events locally:

```bash
stripe listen --forward-to localhost:5173/api/stripe/webhook
```

3. Copy the printed `whsec_...` into `.env`:

```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

In production, add a webhook endpoint in the Stripe dashboard pointing at
`https://yourdomain.com/api/stripe/webhook` subscribed to:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

The endpoint verifies signatures against the raw body — do not add body
parsers or proxies that rewrite it.

## 5. Customer portal

The billing page's "Manage Billing in Stripe" button opens a Customer Portal
session. One-time activation in the Stripe dashboard:

**Settings → Billing → Customer portal** → click _Activate link_ → configure
what customers may do (cancel, switch plan, update payment method) → Save.

## 6. Test the flow

1. `npm run dev`, sign up, go to **Pricing**, subscribe to Pro.
2. Pay with test card `4242 4242 4242 4242` (any future date, any CVC).
3. You land on `/app/dashboard/billing?checkout=success`; within seconds the
   webhook flips your status to `active`.
4. Open the portal, cancel, and confirm the dashboard shows
   `canceled` + access-end date.

## How it fits together

```
Pricing page ── POST /api/stripe/checkout ──▶ Stripe Checkout (hosted)
     ▲                                              │ success
     │                                              ▼
/app/dashboard/billing ◀── webhook writes ── public.subscriptions
     │                                        (service role, RLS bypass)
     └── POST /api/stripe/portal ──▶ Stripe Customer Portal
```

Endpoints live in `src/routes/api/stripe/`; the Stripe client helper is
`src/lib/server/stripe.ts`; webhook persistence is
`src/routes/api/stripe/webhook/+server.ts`.
