# SvelteKit Supabase Authentication Setup

This project uses Supabase Auth with full SSR support through SvelteKit hooks,
PKCE-based OAuth/email links, and a single server-side session validation per
request.

## Features

- ✅ Email/Password authentication (sign-up with email confirmation, sign-in)
- ✅ GitHub OAuth (PKCE flow) — more providers are a config flip away
- ✅ Password reset (request link → set new password)
- ✅ Server-side authentication with `hooks.server.ts`
- ✅ Protected routes with automatic redirects
- ✅ Session management across client and server
- ✅ TypeScript support with proper types

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in your project root:

```bash
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project dashboard under Settings > API.

### 2. Supabase Configuration

#### Enable the GitHub OAuth provider

1. Supabase dashboard → **Authentication > Providers**
2. Enable **GitHub** and add your OAuth app credentials (Client ID + Secret)

GitHub OAuth app setup: <https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app>

- **Homepage URL**: `http://localhost:5173` (development)
- **Authorization callback URL**: `https://your-project-ref.supabase.co/auth/v1/callback`

To add Google/Discord/Twitter, enable them under Authentication > Providers,
then flip `enabled: true` on the entry in
`src/lib/components/auth/AuthForm.svelte`.

#### Site URLs

**Authentication > URL Configuration**:

- **Site URL**: `http://localhost:5173` (dev) / `https://yourdomain.com` (prod)
- **Redirect URLs**: add both origins plus `http://localhost:5173/auth/callback`

## Architecture Overview

### Single validation point (`hooks.server.ts`)

The `authGuard` hook validates the JWT once per request via
`locals.safeGetSession()` (getSession + getUser). Every load function reuses
`locals.session` / `locals.user` — no extra auth-server round trips.

Route rules:

| Path      | Rule                                                                                                                  |
| --------- | --------------------------------------------------------------------------------------------------------------------- |
| `/app/*`  | Requires a session; otherwise redirect to `/auth/login`                                                               |
| `/auth/*` | Signed-in users are redirected to `/app/dashboard`, except: `/auth/logout`, `/auth/callback`, `/auth/update-password` |

### PKCE callback (`/auth/callback`)

All email links and OAuth redirects land on `/auth/callback?code=...&next=...`,
which calls `exchangeCodeForSession(code)` on the server client (cookies are
set by the hook) and forwards to `next`. The `next` value is validated against
open redirects (`safeRedirectPath` in `src/lib/auth/helpers.ts`).

Flows using it:

- OAuth sign-in/sign-up → next defaults to `/app/dashboard`
- Email confirmation link → back to the page that started sign-up
- Password recovery → `/auth/update-password`

## File Structure

```
src/
├── hooks.server.ts                     # Supabase client + auth guard
├── lib/
│   ├── auth/helpers.ts                 # Error mapping, redirect guards
│   ├── components/auth/AuthForm.svelte # Shared login/register form
│   └── supabase-client.ts              # Browser client (PKCE)
└── routes/(app)/auth/
    ├── login/+page.svelte              # Sign in (email/password + OAuth)
    ├── register/+page.svelte           # Sign up
    ├── reset/+page.svelte              # Request password reset email
    ├── update-password/+page.svelte    # Set new password after recovery
    ├── callback/+server.ts             # PKCE code exchange
    └── logout/+page.server.ts          # POST sign-out action
```

## Development

1. `npm run dev`
2. Visit `/auth/register` to create an account (email confirmation depends on
   your Supabase "Confirm email" setting).
3. Try GitHub OAuth on the same page.
4. Visit `/app/dashboard` — protected content.
5. Test password reset via "Forgot your password?" on the sign-in page.

## Security Features

- **JWT validation**: every request validates the access token server-side.
- **Automatic refresh**: tokens refresh through cookie-backed sessions.
- **Open-redirect protection**: post-auth redirects accept only same-site paths.
- **CSRF**: logout is a POST form action; SvelteKit's built-in CSRF checks apply.
