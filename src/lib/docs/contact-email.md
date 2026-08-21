---
title: Contact & Email
description: Resend-powered contact form with validation, honeypot, and rate limiting.
section: content
---

<script>
    import Callout from '$lib/components/docs/Callout.svelte';
</script>

## The flow

`/contact` posts through a SvelteKit form action (`?/send`) with progressive
enhancement — it works without JavaScript and shows inline toasts with it.

The server action in `contact/+page.server.ts`:

1. **Honeypot** — a `website` field hidden from humans; bots that fill it get
   a fake success and their message is dropped
2. **Rate limiting** — sliding window, 5 messages per IP per 10 minutes
   (skipped in dev; swap in Redis for multi-instance production)
3. **Validation** — name/email/subject/message lengths and email shape,
   returning per-field errors
4. **Delivery** — Resend `emails.send()` with escaped HTML + plain text,
   `replyTo` set to the submitter

## Configuration

```env
RESEND_API_KEY="re_..."          # required to actually send
CONTACT_FROM_EMAIL="Site <noreply@yourdomain.com>"
CONTACT_TO_EMAIL="inbox@yourdomain.com"
```

<Callout kind="info" title="Honest dev mode">
    Without <code>RESEND_API_KEY</code> the action logs the message to the
    server console and the UI says so explicitly — it never pretends email was
    delivered.
</Callout>

## Using email elsewhere

The same pattern generalizes to any transactional email. Resend is imported
statically; construct a client inside your action or endpoint:

```ts
import { Resend } from 'resend';

const resend = new Resend(env.RESEND_API_KEY);
await resend.emails.send({
	from: env.CONTACT_FROM_EMAIL,
	to: user.email,
	subject: 'Welcome!',
	html: '<p>Thanks for signing up.</p>'
});
```

For welcome/verification flows, prefer Supabase's built-in auth emails
(configurable in the dashboard) and reserve Resend for custom notifications.
