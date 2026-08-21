---
title: Installation
description: Clone the template, configure Supabase and Stripe, and run it locally.
section: getting-started
---

<script>
    import Callout from '$lib/components/docs/Callout.svelte';
</script>

## Prerequisites

- Node.js 22+
- A [Supabase](https://supabase.com) project (free tier works)
- A [Stripe](https://stripe.com) account for payments (test mode is fine)
- A [Resend](https://resend.com) account for the contact form (optional in dev)

## 1. Clone and install

```bash
git clone https://github.com/LukasParke/Sveltey.git your-saas
cd your-saas
npm install
```

## 2. Configure environment

```bash
cp .env.example .env
```

Fill in the values (see the table below — only the first two are required to boot):

| Variable                                       | Required     | Purpose                           |
| ---------------------------------------------- | ------------ | --------------------------------- |
| `PUBLIC_SUPABASE_URL`                          | yes          | Supabase project URL              |
| `PUBLIC_SUPABASE_ANON_KEY`                     | yes          | Supabase public anon key          |
| `SUPABASE_SERVICE_ROLE_KEY`                    | for webhooks | Server-only key that bypasses RLS |
| `STRIPE_SECRET_KEY`                            | for payments | Stripe API key                    |
| `STRIPE_WEBHOOK_SECRET`                        | for payments | Webhook signature verification    |
| `STRIPE_PRICE_PRO` / `STRIPE_PRICE_ENTERPRISE` | optional     | Existing Stripe Price IDs         |
| `RESEND_API_KEY`                               | for contact  | Contact form email delivery       |
| `CONTACT_FROM_EMAIL` / `CONTACT_TO_EMAIL`      | optional     | Contact form from/to addresses    |

## 3. Create the database tables

Open the Supabase dashboard → SQL editor and run:

```sql
-- See supabase/migrations/0001_subscriptions.sql
```

Or apply it with the Supabase CLI via `supabase db push`. This creates the
`public.subscriptions` table with row-level security policies.

## 4. Enable auth providers

In Supabase → Authentication → Providers, enable **GitHub** (or any provider
you plan to use) and add its OAuth credentials. Full walkthrough:
[Auth flows](/docs/auth-flows).

## 5. Run

```bash
npm run dev
```

Visit `http://localhost:5173`. Sign up at `/auth/register`, and you should land
on your dashboard.

<Callout kind="success" title="Payments without Stripe keys">
    The app boots fine without Stripe configured — the pricing page shows a
    "Payments not configured" banner and checkout buttons stay disabled. Add
    keys when you're ready; nothing else needs to change.
</Callout>

## Scripts

| Script             | What it does                         |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Vite dev server                      |
| `npm run build`    | Production build                     |
| `npm run check`    | Type-check everything (svelte-check) |
| `npm run lint`     | Prettier + ESLint                    |
| `npm run test:e2e` | Playwright suite (21 tests)          |
