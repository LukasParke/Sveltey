---
title: Overview
description: How authentication is architected — one validation point, cookie-backed sessions, PKCE everywhere.
section: authentication
---

<script>
    import Callout from '$lib/components/docs/Callout.svelte';
</script>

## The model

Sveltey uses Supabase Auth with **cookie-backed sessions** managed by SvelteKit
hooks. The design has two rules:

1. **Validate once per request.** The `authGuard` hook calls `getUser()` to
   verify the JWT and stores the result on `event.locals`. Every load function
   reuses `locals.session` / `locals.user` — no additional round trips.
2. **PKCE for everything.** OAuth, email confirmation, and password recovery
   all deliver a one-time `code` to `/auth/callback`, which exchanges it for a
   session server-side. No tokens in URL fragments.

## Request lifecycle

```
Request → hooks.server.ts
            ├─ createServerClient (cookies get/set)
            ├─ safeGetSession() → getSession + getUser (JWT verified here)
            └─ authGuard → route rules → resolve(event)
```

`safeGetSession` is exposed on `locals` so any server code can re-check if
needed, but the guard already ran before your load functions execute.

## Route rules

| Path                | Rule                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| `/app/*`            | Requires a session; anonymous users redirect to `/auth/login?next=…`                               |
| `/app/*` signed-in  | Normal access                                                                                      |
| `/auth/*` signed-in | Redirect to `/app/dashboard`, **except** `/auth/logout`, `/auth/callback`, `/auth/update-password` |
| `/api/*`            | Open by default — endpoints enforce their own auth                                                 |

The exemptions exist because those flows legitimately need or just created a
session: logout signs out, callback exchanges codes, update-password continues
a recovery.

## Where sessions live

Supabase stores the access/refresh tokens in cookies via the hook's
`setAll`. On the client, `$lib/supabase-client.ts` creates a browser client
with the same PKCE flow, so `onAuthStateChange` in the root layout can refresh
server state through `invalidate('supabase:auth')`.
