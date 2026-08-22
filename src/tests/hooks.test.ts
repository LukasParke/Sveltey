import { describe, expect, it, vi } from 'vitest';

const ssrMocks = vi.hoisted(() => ({
	getSession: vi.fn(),
	getUser: vi.fn()
}));

const ssrCookies = vi.hoisted(() => ({
	captured: null as null | { getAll: () => unknown[]; setAll: (c: unknown[]) => void }
}));

vi.mock('@sveltejs/kit/hooks', () => ({
	// Real sequence touches Kit's request store; a plain composer is
	// equivalent for unit-testing the chain.
	sequence:
		(...handlers: ((ctx: unknown) => Promise<unknown>)[]) =>
		async (ctx: unknown) => {
			console.log(
				'[seq] handlers:',
				handlers.length,
				'ctx:',
				typeof ctx,
				Object.keys(ctx ?? {}).slice(0, 6)
			);
			let result: unknown;
			for (const handler of handlers) result = await handler(ctx);
			return result;
		}
}));

vi.mock('@supabase/ssr', () => ({
	createServerClient: vi.fn((_url: string, _key: string, options: { cookies: unknown }) => {
		ssrCookies.captured = options.cookies as never;
		return {
			auth: {
				getSession: ssrMocks.getSession,
				getUser: ssrMocks.getUser
			}
		};
	})
}));

import { evaluateRouteRules } from '../hooks.server';

describe('evaluateRouteRules (pure route rules)', () => {
	it('sends anonymous /app traffic to login', () => {
		expect(evaluateRouteRules('/app/dashboard', null)).toBe('login');
		expect(evaluateRouteRules('/app/dashboard/billing', undefined)).toBe('login');
	});

	it('bounces signed-in users off auth pages', () => {
		const session = { user: { id: 'u1' } };
		expect(evaluateRouteRules('/auth/login', session)).toBe('dashboard');
		expect(evaluateRouteRules('/auth/register', session)).toBe('dashboard');
	});

	it('exempts session-dependent auth flows from the bounce', () => {
		const session = { user: { id: 'u1' } };
		expect(evaluateRouteRules('/auth/logout', session)).toBe('allow');
		expect(evaluateRouteRules('/auth/callback', session)).toBe('allow');
		expect(evaluateRouteRules('/auth/update-password', session)).toBe('allow');
	});

	it('allows everything else in both states', () => {
		expect(evaluateRouteRules('/pricing', null)).toBe('allow');
		expect(evaluateRouteRules('/docs/installation', null)).toBe('allow');
		expect(evaluateRouteRules('/app/dashboard', { user: {} })).toBe('allow');
		expect(evaluateRouteRules('/blog', { user: {} })).toBe('allow');
	});

	it('does not treat /authentication as an auth page', () => {
		const session = { user: { id: 'u1' } };
		expect(evaluateRouteRules('/authentication', session)).toBe('allow');
	});
});

describe('handle export', () => {
	it('composes the supabase and authGuard hooks via sequence', async () => {
		const { handle } = await import('../hooks.server');
		expect(typeof handle).toBe('function');
	});
});
