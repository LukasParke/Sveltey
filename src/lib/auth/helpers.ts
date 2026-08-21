import type { User } from '@supabase/supabase-js';

/**
 * Map Supabase auth error payloads (from URL params or thrown errors) to
 * user-friendly messages. Shared by the auth pages and the callback route.
 */
export function describeAuthError(
	errorCode: string | null,
	errorDescription: string | null
): string {
	switch (errorCode) {
		case 'unexpected_failure':
			if (errorDescription?.includes('user profile from external provider')) {
				return 'Unable to retrieve your profile from the OAuth provider. This may be due to privacy settings or a temporary issue. Please try again.';
			}
			return 'An unexpected error occurred during authentication. Please try again.';
		case 'oauth_callback_error':
			return 'OAuth authentication was cancelled or failed. Please try again.';
		case 'access_denied':
			return 'Access was denied by the OAuth provider. Please try again and ensure you grant the necessary permissions.';
		case 'server_error':
			return 'A server error occurred during authentication. Please try again in a moment.';
		case 'invalid_credentials':
			return 'Invalid email or password. Please check your details and try again.';
		case 'email_not_confirmed':
			return 'Please confirm your email address before signing in. Check your inbox for the confirmation link.';
		case 'user_banned':
			return 'This account has been disabled. Contact support if you believe this is a mistake.';
		case 'over_request_rate_limit':
			return 'Too many attempts. Please wait a moment before trying again.';
		default:
			if (errorDescription) {
				return decodeURIComponent(errorDescription.replace(/\+/g, ' '));
			}
			return 'Authentication failed. Please try again.';
	}
}

/**
 * Extract Supabase auth error parameters from URL search and/or hash fragments.
 */
export function extractAuthErrorParams(
	search: URLSearchParams,
	hash: string
): { error: string | null; errorCode: string | null; errorDescription: string | null } {
	const hashParams = new URLSearchParams(hash.substring(1));
	return {
		error: search.get('error') || hashParams.get('error'),
		errorCode: search.get('error_code') || hashParams.get('error_code'),
		errorDescription: search.get('error_description') || hashParams.get('error_description')
	};
}

/**
 * Only allow same-site relative paths as post-auth redirect targets.
 */
export function safeRedirectPath(
	path: string | null | undefined,
	fallback = '/app/dashboard'
): string {
	if (!path) return fallback;
	if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return fallback;
	return path;
}

/**
 * Derive a display name for a user across OAuth and email/password sign-ups.
 */
export function userDisplayName(user: User | null | undefined): string {
	const meta = user?.user_metadata ?? {};
	return meta.full_name || meta.name || user?.email?.split('@')[0] || 'User';
}
