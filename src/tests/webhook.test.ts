import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	env: {} as Record<string, string | undefined>,
	constructEventAsync: vi.fn(),
	subscriptionsRetrieve: vi.fn(),
	adminMaybeSingle: vi.fn(),
	adminUpsert: vi.fn()
}));

vi.mock('$env/dynamic/private', () => ({ env: mocks.env }));

vi.mock('$lib/server/supabase-admin', () => ({
	getSupabaseAdmin: vi.fn(() => {
		const chain = {
			select: vi.fn(() => chain),
			eq: vi.fn(() => chain),
			maybeSingle: mocks.adminMaybeSingle,
			upsert: mocks.adminUpsert
		};
		return { from: vi.fn(() => chain) };
	})
}));

vi.mock('stripe', () => ({
	default: class MockStripe {
		webhooks = { constructEventAsync: mocks.constructEventAsync };
		subscriptions = { retrieve: mocks.subscriptionsRetrieve };
	}
}));

function subscription(over: Record<string, unknown> = {}) {
	return {
		id: 'sub_123',
		customer: 'cus_123',
		status: 'active',
		cancel_at_period_end: false,
		metadata: {},
		current_period_end: 1767225600,
		items: { data: [{ price: { id: 'price_test_1' }, current_period_end: 1767225600 }] },
		...over
	};
}

async function post() {
	const body = JSON.stringify({ any: 'body' });
	const req = new Request('http://localhost/api/stripe/webhook', {
		method: 'POST',
		body,
		headers: { 'stripe-signature': 'sig_test' }
	});
	Object.defineProperty(req, 'arrayBuffer', {
		value: async () => new TextEncoder().encode(body).buffer
	});
	const { POST } = await import('../routes/api/stripe/webhook/+server');
	return POST({ request: req } as never);
}

describe('webhook branch coverage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.env.STRIPE_SECRET_KEY = 'sk_test_x';
		mocks.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
		mocks.env.STRIPE_PRICE_PRO = 'price_test_1';
		mocks.adminMaybeSingle.mockResolvedValue({ data: null });
		mocks.adminUpsert.mockResolvedValue({ error: null });
	});

	it('mirrors checkout.session.completed using the client reference id', async () => {
		mocks.subscriptionsRetrieve.mockResolvedValue(subscription());
		mocks.constructEventAsync.mockResolvedValue({
			type: 'checkout.session.completed',
			data: {
				object: {
					mode: 'subscription',
					subscription: 'sub_123',
					client_reference_id: 'user-hint'
				}
			}
		});

		const res = await post();
		expect(res.status).toBe(200);
		expect(mocks.subscriptionsRetrieve).toHaveBeenCalledWith('sub_123');
		expect(mocks.adminUpsert).toHaveBeenCalledWith(
			expect.objectContaining({
				user_id: 'user-hint',
				plan_id: 'pro',
				stripe_subscription_id: 'sub_123',
				status: 'active',
				current_period_end: '2026-01-01T00:00:00.000Z',
				cancel_at_period_end: false
			}),
			{ onConflict: 'user_id' }
		);
	});

	it('ignores checkout sessions that are not subscription mode', async () => {
		mocks.constructEventAsync.mockResolvedValue({
			type: 'checkout.session.completed',
			data: { object: { mode: 'payment', subscription: null } }
		});
		const res = await post();
		expect(res.status).toBe(200);
		expect(mocks.subscriptionsRetrieve).not.toHaveBeenCalled();
		expect(mocks.adminUpsert).not.toHaveBeenCalled();
	});

	it('resolves the user through the stored customer when metadata is absent', async () => {
		mocks.adminMaybeSingle.mockResolvedValue({ data: { user_id: 'user-via-customer' } });
		mocks.constructEventAsync.mockResolvedValue({
			type: 'customer.subscription.updated',
			data: { object: subscription() }
		});

		const res = await post();
		expect(res.status).toBe(200);
		expect(mocks.adminMaybeSingle).toHaveBeenCalled();
		expect(mocks.adminUpsert).toHaveBeenCalledWith(
			expect.objectContaining({ user_id: 'user-via-customer' }),
			{ onConflict: 'user_id' }
		);
	});

	it('falls back to subscription metadata plan ids for inline prices', async () => {
		mocks.env.STRIPE_PRICE_PRO = '';
		mocks.constructEventAsync.mockResolvedValue({
			type: 'customer.subscription.updated',
			data: {
				object: subscription({ metadata: { user_id: 'u-meta', plan_id: 'enterprise' } })
			}
		});

		await post();
		expect(mocks.adminUpsert).toHaveBeenCalledWith(
			expect.objectContaining({ plan_id: 'enterprise' }),
			{ onConflict: 'user_id' }
		);
	});

	it('marks deleted subscriptions as canceled but keeps the row', async () => {
		mocks.constructEventAsync.mockResolvedValue({
			type: 'customer.subscription.deleted',
			data: {
				object: subscription({
					status: 'canceled',
					cancel_at_period_end: true,
					metadata: { user_id: 'user-meta' }
				})
			}
		});

		const res = await post();
		expect(res.status).toBe(200);
		expect(mocks.adminUpsert).toHaveBeenCalledWith(
			expect.objectContaining({ status: 'canceled', cancel_at_period_end: true }),
			{ onConflict: 'user_id' }
		);
	});

	it('acknowledges unresolvable users without writing', async () => {
		mocks.adminMaybeSingle.mockResolvedValue({ data: null });
		mocks.constructEventAsync.mockResolvedValue({
			type: 'customer.subscription.updated',
			data: { object: subscription() }
		});

		const res = await post();
		expect(res.status).toBe(200);
		expect(mocks.adminUpsert).not.toHaveBeenCalled();
	});

	it('returns 500 when persistence fails so Stripe retries', async () => {
		mocks.adminUpsert.mockRejectedValue(new Error('db down'));
		mocks.constructEventAsync.mockResolvedValue({
			type: 'customer.subscription.updated',
			data: { object: subscription({ metadata: { user_id: 'u1' } }) }
		});

		const res = await post();
		expect(res.status).toBe(500);
	});

	it('acknowledges unknown event types without action', async () => {
		mocks.constructEventAsync.mockResolvedValue({
			type: 'invoice.paid',
			data: { object: {} }
		});
		const res = await post();
		expect(res.status).toBe(200);
		expect(mocks.adminUpsert).not.toHaveBeenCalled();
	});
});
