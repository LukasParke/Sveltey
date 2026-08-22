import { describe, expect, it } from 'vitest';
import {
	describeAuthError,
	extractAuthErrorParams,
	safeRedirectPath,
	userDisplayName
} from '$lib/auth/helpers';

describe('describeAuthError', () => {
	it('maps known error codes to friendly copy', () => {
		expect(describeAuthError('invalid_credentials', null)).toMatch(/Invalid email or password/);
		expect(describeAuthError('email_not_confirmed', null)).toMatch(/confirm your email/i);
		expect(describeAuthError('access_denied', null)).toMatch(/denied by the OAuth provider/i);
		expect(describeAuthError('oauth_callback_error', null)).toMatch(/cancelled or failed/i);
		expect(describeAuthError('server_error', null)).toMatch(/server error occurred/i);
		expect(describeAuthError('user_banned', null)).toMatch(/has been disabled/i);
		expect(describeAuthError('over_request_rate_limit', null)).toMatch(/Too many attempts/i);
	});

	it('special-cases unexpected_failure with profile message', () => {
		const msg = describeAuthError(
			'unexpected_failure',
			'Failed to fetch user profile from external provider'
		);
		expect(msg).toMatch(/profile from the OAuth provider/i);
	});

	it('falls back for unexpected_failure without profile context', () => {
		expect(describeAuthError('unexpected_failure', 'boom')).toMatch(/unexpected error occurred/i);
	});

	it('uses the description when code is unknown', () => {
		expect(describeAuthError(null, 'Something+specific+happened')).toBe(
			'Something specific happened'
		);
	});

	it('returns generic copy when nothing is known', () => {
		expect(describeAuthError(null, null)).toBe('Authentication failed. Please try again.');
	});
});

describe('extractAuthErrorParams', () => {
	it('reads from search params', () => {
		const search = new URLSearchParams('error=x&error_code=y&error_description=z');
		expect(extractAuthErrorParams(search, '')).toEqual({
			error: 'x',
			errorCode: 'y',
			errorDescription: 'z'
		});
	});

	it('falls back to hash fragments', () => {
		const params = extractAuthErrorParams(new URLSearchParams(), '#error=a&error_code=b');
		expect(params.error).toBe('a');
		expect(params.errorCode).toBe('b');
		expect(params.errorDescription).toBeNull();
	});
});

describe('safeRedirectPath', () => {
	it('allows same-site relative paths', () => {
		expect(safeRedirectPath('/pricing')).toBe('/pricing');
		expect(safeRedirectPath('/app/dashboard/billing')).toBe('/app/dashboard/billing');
	});

	it('rejects protocol-relative, backslashes, and absolute URLs', () => {
		expect(safeRedirectPath('//evil.com')).toBe('/app/dashboard');
		expect(safeRedirectPath('\\evil')).toBe('/app/dashboard');
		expect(safeRedirectPath('https://evil.com')).toBe('/app/dashboard');
		expect(safeRedirectPath(null)).toBe('/app/dashboard');
	});

	it('honors custom fallbacks', () => {
		expect(safeRedirectPath(undefined, '/auth/login')).toBe('/auth/login');
	});
});

describe('userDisplayName', () => {
	const base = { email: 'a@b.dev' } as never;

	it('prefers full_name then name then email local part', () => {
		const user = { user_metadata: { full_name: 'Full', name: 'Nick' }, email: 'a@b.dev' } as never;
		expect(userDisplayName(user)).toBe('Full');

		const nickOnly = { user_metadata: { name: 'Nick' }, email: 'a@b.dev' } as never;
		expect(userDisplayName(nickOnly)).toBe('Nick');
		expect(userDisplayName(base)).toBe('a');
	});

	it('falls back to User when nothing exists', () => {
		expect(userDisplayName({ user_metadata: {} } as never)).toBe('User');
		expect(userDisplayName(null)).toBe('User');
	});
});
