---
title: Protecting Routes
description: Server-side guards, the allowlist pattern, and protecting API endpoints.
section: authentication
---

## The guard

All route protection lives in one place — `hooks.server.ts`:

```ts
const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	if (!session && pathname.startsWith('/app')) {
		redirect(303, '/auth/login');
	}

	const authExempt = ['/auth/logout', '/auth/callback', '/auth/update-password'];
	if (session && pathname.startsWith('/auth') && !authExempt.some((p) => pathname.startsWith(p))) {
		redirect(303, '/app/dashboard');
	}

	return resolve(event);
};
```

## Adding a protected area

To protect a new top-level area (say `/admin`), add one rule:

```ts
if (!session && pathname.startsWith('/admin')) {
	redirect(303, '/auth/login');
}
```

Because the guard runs on every request, protection cannot be forgotten on a
new child route — the prefix covers the whole tree.

## Role-based access

`locals.user` carries `app_metadata` from Supabase. For an admin area, check a
custom claim:

```ts
if (pathname.startsWith('/admin')) {
	if (!session || user.app_metadata.role !== 'admin') {
		redirect(303, '/auth/login');
	}
}
```

Set the claim with Supabase's `auth.admin.updateUserById` from trusted server
code — never from client input.

## API endpoints

`/api/*` is not covered by the redirect guard (redirecting an API call is
useless). Endpoints enforce auth explicitly:

```ts
export const POST: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	if (!user) redirect(303, '/auth/login'); // or return json(..., { status: 401 })
	// …
};
```

`/api/stripe/checkout` and `/api/stripe/portal` do exactly this — see
[Checkout & Portal](/docs/checkout-and-portal).
