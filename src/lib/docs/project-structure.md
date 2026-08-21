---
title: Project Structure
description: Where everything lives and why it is arranged that way.
section: getting-started
---

## Top level

```
src/
├── lib/                # Shared code ($lib alias)
│   ├── auth/           # Auth helpers (error mapping, redirect guards)
│   ├── components/     # Svelte components (docs/, auth/, icons/, MDSvex/)
│   ├── config/         # plans.ts (Stripe), docs.ts (documentation registry)
│   ├── server/         # Server-only modules (Stripe client, service-role Supabase)
│   ├── posts/          # Blog posts (.md, mdsvex)
│   └── docs/           # Documentation pages (.md, mdsvex) — this site
├── routes/
│   ├── api/stripe/     # checkout, portal, webhook endpoints
│   ├── (app)/          # Authenticated shell: dashboard + auth flows
│   └── (marketing)/    # Public: home, pricing, blog, contact, legal, /docs
├── app.html            # Shell with pre-hydration theme bootstrap
└── hooks.server.ts     # Supabase session + route guards

supabase/migrations/    # SQL migrations (subscriptions table + RLS)
tests/smoke.spec.ts     # Playwright e2e suite
```

## Route groups

SvelteKit route groups `(app)` and `(marketing)` share layouts without
affecting URLs:

- **`(marketing)`** — public pages. Anything here is crawlable marketing
  surface: home, pricing, blog, contact, terms, privacy, and `/docs`.
- **`(app)`** — the authenticated shell. `/app/dashboard`, billing, profile,
  plus the auth pages (`/auth/*`) which live in this group because they share
  its layout rather than the marketing chrome.

## Server-only boundary

Anything under `src/lib/server/` can only be imported by server code —
SvelteKit enforces this at build time. Two modules live there:

- `stripe.ts` — lazily constructs the Stripe client from `STRIPE_SECRET_KEY`
- `supabase-admin.ts` — service-role Supabase client used by webhooks to write
  subscription rows despite RLS

## Configuration modules

- `src/lib/config/plans.ts` — plan definitions consumed by pricing UI,
  checkout, and the webhook's price→plan mapping
- `src/lib/config/docs.ts` — the documentation registry driving this section

## Conventions

- **One validation point for sessions**: `hooks.server.ts` validates each
  request once; every load reads `locals.session` / `locals.user`.
- **Config-driven pricing**: plans exist in one file; checkout falls back to
  inline Stripe prices when no Price IDs are configured.
- **Honest degradation**: missing optional keys (Stripe, Resend) produce clear
  banners or dev-mode notices instead of fake success.
