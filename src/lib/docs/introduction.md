---
title: Introduction
description: What Sveltey is, what ships in the box, and the stack behind it.
section: getting-started
---

<script>
    import Callout from '$lib/components/docs/Callout.svelte';
</script>

## What is Sveltey?

Sveltey is a production-ready **SaaS template** built on SvelteKit 2, Svelte 5, Supabase, and Skeleton UI. It ships the parts of every SaaS that are identical across products — authentication, subscriptions, theming, marketing pages, transactional email — so you can start on the part that makes your product yours.

Everything in the template is real, wired-up code: Stripe subscriptions actually create checkout sessions, the contact form actually sends email, and all 24 themes actually restyle the app.

## What's included

| Area           | What you get                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------- |
| Authentication | Supabase Auth with PKCE OAuth (GitHub), email/password, password reset, server-side route guards  |
| Payments       | Native Stripe Checkout subscriptions, customer portal, signature-verified webhooks, plan registry |
| Theming        | 24 Skeleton v5 themes, dark/light mode without flash, persistent preferences                      |
| Content        | MDX-style markdown blog and this documentation site, both with live Svelte components             |
| Email          | Resend-powered contact form with validation, honeypot, and rate limiting                          |
| Quality        | TypeScript strict, ESLint 10 + Prettier, 21-test Playwright suite                                 |

## The stack

- **SvelteKit 2 + Svelte 5** (runes) — server-rendered, adapter-auto deploy target
- **Tailwind CSS 4** with the Skeleton v5 design system
- **Supabase** — Postgres, Auth, RLS
- **Stripe** — Checkout, Customer Portal, webhooks
- **Resend** — transactional email
- **mdsvex** — MDX-style markdown (components inside `.md` files) for blog and docs

<Callout kind="info" title="MDX in a Svelte world">
    Sveltey uses <strong>mdsvex</strong>, the Svelte ecosystem's equivalent of MDX: write markdown, import Svelte components, render them inline. Same authoring model as MDX, native to SvelteKit — no React runtime required.
</Callout>

## Where to go next

- [Installation](/docs/installation) — clone, configure, run
- [Authentication overview](/docs/authentication-overview) — how the auth architecture fits together
- [Payments overview](/docs/payments-overview) — the Stripe integration end to end
