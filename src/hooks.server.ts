import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const supabase: Handle = async ({ event, resolve }) => {
	/**
	 * Creates a Supabase client specific to this server request.
	 *
	 * The Supabase client is configured to:
	 * 1. Use cookies for session persistence
	 * 2. Automatically refresh expired tokens
	 * 3. Handle server-side authentication
	 */
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll() {
				return event.cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});

	/**
	 * Unlike `supabase.auth.getSession()`, which returns the session _without_
	 * validating the JWT, this function also calls `getUser()` to validate the
	 * JWT before returning the session.
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) {
			return { session: null, user: null };
		}

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) {
			// JWT validation has failed
			return { session: null, user: null };
		}

		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			/**
			 * Supabase libraries use the `content-range` and `x-supabase-api-version`
			 * headers, so we need to tell SvelteKit to pass it through.
			 */
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();

	event.locals.session = session;
	event.locals.user = user;

	const { pathname } = event.url;

	// Protect routes that require authentication
	if (!session && pathname.startsWith('/app')) {
		redirect(303, '/auth/login');
	}

	/**
	 * Redirect authenticated users away from auth pages. Flows that legitimately
	 * require (or just established) a session are exempt:
	 * - /auth/logout: POST action signs the user out
	 * - /auth/callback: exchanges PKCE/OAuth codes for a session
	 * - /auth/update-password: password recovery requires the session created by the callback
	 */
	const authExempt = ['/auth/logout', '/auth/callback', '/auth/update-password'];
	if (session && pathname.startsWith('/auth') && !authExempt.some((p) => pathname.startsWith(p))) {
		redirect(303, '/app/dashboard');
	}

	return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard);
