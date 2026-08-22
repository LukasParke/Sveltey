import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	createClient: vi.fn(),
	env: {} as Record<string, string | undefined>
}));

vi.mock('$env/dynamic/private', () => ({ env: mocks.env }));
vi.mock('@supabase/supabase-js', () => ({ createClient: mocks.createClient }));

describe('server-only clients', () => {
	afterEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
	});

	describe('$lib/server/stripe', () => {
		it('returns null when STRIPE_SECRET_KEY is unset', async () => {
			delete mocks.env.STRIPE_SECRET_KEY;
			const { getStripe, isStripeConfigured } = await import('$lib/server/stripe');
			expect(getStripe()).toBeNull();
			expect(isStripeConfigured()).toBe(false);
		});

		it('constructs a client when configured', async () => {
			mocks.env.STRIPE_SECRET_KEY = 'sk_test_x';
			const { getStripe, isStripeConfigured } = await import('$lib/server/stripe');
			expect(isStripeConfigured()).toBe(true);
			expect(getStripe()).not.toBeNull();
		});

		it('resolves configured price ids per plan', async () => {
			mocks.env.STRIPE_PRICE_PRO = 'price_pro';
			const { getPriceIdForPlan } = await import('$lib/server/stripe');
			expect(getPriceIdForPlan('pro')).toBe('price_pro');
			expect(getPriceIdForPlan('enterprise')).toBeNull();
		});
	});

	describe('$lib/server/supabase-admin', () => {
		it('returns null without the service role key', async () => {
			delete mocks.env.SUPABASE_SERVICE_ROLE_KEY;
			mocks.env.SUPABASE_URL = 'https://db.test';
			const { getSupabaseAdmin } = await import('$lib/server/supabase-admin');
			expect(getSupabaseAdmin()).toBeNull();
		});

		it('creates a non-persisting client with the service role key', async () => {
			mocks.createClient.mockReturnValue({ marker: true });
			mocks.env.SUPABASE_URL = 'https://db.test';
			mocks.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
			const { getSupabaseAdmin } = await import('$lib/server/supabase-admin');
			const client = getSupabaseAdmin();
			expect(client).toMatchObject({ marker: true });
			expect(mocks.createClient).toHaveBeenCalledWith(
				'https://db.test',
				'service-key',
				expect.objectContaining({ auth: { persistSession: false, autoRefreshToken: false } })
			);
		});
	});
});

describe('$lib/server/supabase-admin url fallback', () => {
	it('falls back to the public Supabase URL for the project URL', async () => {
		vi.resetModules();
		delete mocks.env.SUPABASE_URL;
		mocks.env.PUBLIC_SUPABASE_URL = 'https://fallback.test';
		mocks.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';

		const { getSupabaseAdmin } = await import('$lib/server/supabase-admin');
		getSupabaseAdmin();

		expect(mocks.createClient).toHaveBeenCalledWith(
			'https://fallback.test',
			'service-key',
			expect.anything()
		);
	});
});
