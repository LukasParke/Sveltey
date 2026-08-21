import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { safeRedirectPath } from '$lib/auth/helpers';

/**
 * PKCE / OAuth callback: exchanges the one-time code for a session.
 * Works for OAuth sign-in, email confirmation links, and password recovery links
 * (recovery links pass next=/auth/update-password).
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	const next = safeRedirectPath(url.searchParams.get('next'));

	if (code) {
		const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			redirect(303, next);
		}
	}

	// Missing/invalid code: bounce to login with a user-facing message.
	redirect(
		303,
		'/auth/login?error=invalid_request&error_description=' +
			encodeURIComponent('Your sign-in link is invalid or has expired. Please try again.')
	);
};
