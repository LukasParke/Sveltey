---
title: Deployment
description: Ship to Vercel, Netlify, or any Node host — plus production checklists.
section: getting-started
---

<script>
    import Callout from '$lib/components/docs/Callout.svelte';
</script>

## Choosing an adapter

The template ships with `@sveltejs/adapter-auto`, which detects the deployment
platform at build time. For explicit control, swap it:

```bash
npm i -D @sveltejs/adapter-vercel   # or adapter-netlify, adapter-node
```

Then in `svelte.config.js`:

```js
import adapter from '@sveltejs/adapter-vercel';

const config = {
	kit: {
		adapter: adapter()
	}
};
```

## Environment variables

Set every variable from [Installation](/docs/installation) in your hosting
dashboard. The service-role key and webhook secret are **server-side only** —
never prefix them with `PUBLIC_`.

<Callout kind="warning" title="Stripe webhook reachability">
    Your deployment must expose <code>POST /api/stripe/webhook</code> over
    public HTTPS. Local testing uses the Stripe CLI instead (see
    <a href="/docs/webhooks">Webhooks</a>).
</Callout>

## Production checklist

1. **Supabase** — set Site URL and redirect URLs to your production domain;
   run the subscriptions migration against the production database.
2. **Stripe** — switch to live keys; create live Products/Prices and fill
   `STRIPE_PRICE_PRO` / `STRIPE_PRICE_ENTERPRISE`; add a production webhook
   endpoint; activate the Customer Portal link.
3. **Resend** — verify your sending domain and update `CONTACT_FROM_EMAIL`.
4. **OAuth** — add the production callback URL (`https://yourdomain.com/auth/callback`)
   to the allowlist in Supabase Auth settings.
5. **Verify** — sign up, subscribe with a real card, confirm the webhook flips
   your subscription status on the billing page.

## Continuous integration

`npm run lint`, `npm run check`, `npm run build`, and `npm run test:e2e`
compose a complete CI pipeline. The e2e suite starts its own dev server, so it
needs no running services — every external dependency degrades gracefully.
