---
title: Auth Flows
description: Sign-up, sign-in, OAuth, password reset — every flow and where it lives.
section: authentication
---

## Sign-up and sign-in

Both pages render the shared `AuthForm.svelte` component (`mode="login"` or
`mode="register"`), so behavior stays identical:

- **Sign-up** calls `supabase.auth.signUp()` with an `emailRedirectTo` pointing
  at `/auth/callback`. If email confirmation is enabled in Supabase, the user
  sees a "check your inbox" state; otherwise they are signed in immediately.
- **Sign-in** calls `signInWithPassword()` and navigates to the validated
  `?next=` target (defaults to the dashboard).

Error messages come from `describeAuthError()` in `$lib/auth/helpers.ts`,
which maps Supabase error codes (`invalid_credentials`,
`email_not_confirmed`, rate-limit codes, …) to friendly copy.

## OAuth (GitHub, and friends)

```ts
await supabase.auth.signInWithOAuth({
	provider: 'github',
	options: { redirectTo: `${origin}/auth/callback?next=${next}` }
});
```

GitHub is enabled out of the box. To add Google, Discord, or X: enable the
provider in Supabase → Authentication → Providers, then flip `enabled: true`
on its entry in `AuthForm.svelte`.

Brand icons for these buttons live in `src/lib/components/icons/` — lucide
dropped brand marks in v1, so GitHub/Google/X/LinkedIn are first-party SVG
components.

## The callback route

`/auth/callback` is the single landing point for every code-bearing redirect:

```ts
const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
if (!error) redirect(303, next);
```

`next` is validated by `safeRedirectPath()` — only same-site relative paths
are allowed, defeating open redirects. The route is exempt from the
signed-in-bounce guard because it _just created_ the session.

## Password reset

1. `/auth/reset` — user submits their email;
   `resetPasswordForEmail()` sends the recovery link with
   `next=/auth/update-password`.
2. Supabase emails the link → `/auth/callback?code=…&next=/auth/update-password`.
3. The callback exchanges the code (this signs the user in) and forwards to
   `/auth/update-password`, which calls `supabase.auth.updateUser({ password })`.

## Logout

A POST form action at `/auth/logout` calls `signOut()` and redirects home.
GET requests to the same URL simply redirect to `/` — the action is POST-only.
