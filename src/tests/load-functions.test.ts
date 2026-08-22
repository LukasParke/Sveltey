import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	env: {} as Record<string, string | undefined>
}));

vi.mock('$env/dynamic/private', () => ({ env: mocks.env }));

import { load as pricingLoad } from '../routes/(marketing)/pricing/+page.server';
import { load as docsLandingLoad } from '../routes/(marketing)/docs/+page.server';
import { load as rootLayoutLoad } from '../routes/+layout.server';
import { load as dashboardLoad } from '../routes/(app)/app/dashboard/+page.server';
import { load as billingLoad } from '../routes/(app)/app/dashboard/billing/+page.server';
import { load as blogLoad } from '../routes/(marketing)/blog/+page.server';
import { actions, load as logoutLoad } from '../routes/(app)/auth/logout/+page.server';

async function callLoad<T>(load: unknown, event: unknown = {}): Promise<T> {
	return (load as (event: unknown) => Promise<T>)(event);
}

function queryChain(result: unknown) {
	const chain = {
		select: vi.fn(() => chain),
		eq: vi.fn(() => chain),
		maybeSingle: vi.fn(async () => ({ data: result }))
	};
	return {
		locals: { supabase: { from: vi.fn(() => chain) } },
		chain
	};
}

const user = { id: 'u1' };

beforeEach(() => {
	vi.clearAllMocks();
	for (const key of Object.keys(mocks.env)) delete mocks.env[key];
});

describe('root layout server load', () => {
	it('passes through hook-validated session, user and cookies', async () => {
		const cookies = { getAll: () => [{ name: 'c', value: 'v' }] };
		const locals = { session: { user: {} }, user };
		const result = await callLoad<{ session: unknown; user: unknown; cookies: unknown[] }>(
			rootLayoutLoad,
			{ locals, cookies }
		);
		expect(result).toEqual({
			session: locals.session,
			user,
			cookies: [{ name: 'c', value: 'v' }]
		});
	});
});

describe('dashboard page server load', () => {
	it('queries the subscription for the current user', async () => {
		const row = {
			plan_id: 'pro',
			status: 'active',
			current_period_end: '2026-01-01',
			cancel_at_period_end: false
		};
		const { locals } = queryChain(row);
		const result = await callLoad<{ subscription: typeof row }>(dashboardLoad, {
			locals: { user, supabase: locals.supabase }
		});

		expect(result.subscription).toMatchObject({ plan_id: 'pro', status: 'active' });
	});
});

describe('billing page server load', () => {
	it('returns the full subscription row and stripe configuration state', async () => {
		mocks.env.STRIPE_SECRET_KEY = 'sk_test_x';
		const row = {
			plan_id: 'pro',
			status: 'active',
			current_period_end: '2026-01-01T00:00:00Z',
			cancel_at_period_end: false,
			stripe_customer_id: 'cus_1',
			stripe_subscription_id: 'sub_1'
		};
		const { locals } = queryChain(row);
		const result = await callLoad<{
			subscription: typeof row;
			stripeConfigured: boolean;
		}>(billingLoad, { locals: { user, supabase: locals.supabase } });

		expect(result.subscription).toEqual(row);
		expect(result.stripeConfigured).toBe(true);
	});

	it('reports Stripe unconfigured when the key is absent', async () => {
		const { locals } = queryChain(null);
		const result = await callLoad<{ stripeConfigured: boolean }>(billingLoad, {
			locals: { user, supabase: locals.supabase }
		});
		expect(result.stripeConfigured).toBe(false);
	});
});

describe('pricing page server load', () => {
	it('reports unconfigured Stripe and no subscription for anonymous users', async () => {
		const result = await callLoad<{
			stripeConfigured: boolean;
			session: null;
			subscription: null;
			pageMetaTags: { title: string };
		}>(pricingLoad, {
			locals: { user: null, session: null, supabase: { from: vi.fn() } },
			url: new URL('http://localhost:5173/pricing')
		});
		expect(result.stripeConfigured).toBe(false);
		expect(result.session).toBeNull();
		expect(result.subscription).toBeNull();
		expect(result.pageMetaTags.title).toBe('Pricing');
	});

	it('queries subscription state for signed-in users', async () => {
		mocks.env.STRIPE_SECRET_KEY = 'sk_test_x';
		const { locals } = queryChain({ plan_id: 'pro', status: 'active' });
		const result = await callLoad<{
			stripeConfigured: boolean;
			subscription: { plan_id: string } | null;
		}>(pricingLoad, {
			locals: { user, session: { user }, supabase: locals.supabase },
			url: new URL('http://localhost:5173/pricing')
		});
		expect(result.stripeConfigured).toBe(true);
		expect(result.subscription?.plan_id).toBe('pro');
	});
});

describe('docs landing server load', () => {
	it('returns all sections with documentation meta tags', async () => {
		const result = await callLoad<{
			sections: unknown[];
			pageMetaTags: { title: string };
		}>(docsLandingLoad, { url: new URL('http://localhost:5173/docs') });
		expect(result.sections).toHaveLength(6);
		expect(result.pageMetaTags.title).toBe('Documentation');
	});
});

describe('blog listing server load', () => {
	it('returns posts for the listing page', async () => {
		const result = await callLoad<{ posts: unknown[] }>(blogLoad);
		expect(result.posts.length).toBeGreaterThan(0);
	});
});

describe('logout route', () => {
	it('redirects GET requests home', async () => {
		let caught: { status: number; location: string } | undefined;
		try {
			await callLoad(logoutLoad);
		} catch (e) {
			caught = e as { status: number; location: string };
		}
		expect(caught?.status).toBe(303);
		expect(caught?.location).toBe('/');
	});

	it('signs out and redirects on POST', async () => {
		const signOut = vi.fn(async () => ({ error: null }));
		let actionRedirect: { status: number; location: string } | undefined;
		try {
			await (actions.default as (ctx: unknown) => Promise<unknown>)({
				locals: { supabase: { auth: { signOut } } }
			});
		} catch (e) {
			actionRedirect = e as { status: number; location: string };
		}
		expect(signOut).toHaveBeenCalledTimes(1);
		expect(actionRedirect?.status).toBe(303);
		expect(actionRedirect?.location).toBe('/');
	});
});
