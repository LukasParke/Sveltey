import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	env: {} as Record<string, string | undefined>,
	customersCreate: vi.fn(),
	checkoutCreate: vi.fn(),
	portalCreate: vi.fn()
}));

vi.mock('$env/dynamic/private', () => ({ env: mocks.env }));

vi.mock('stripe', () => ({
	default: class MockStripe {
		customers = { create: mocks.customersCreate };
		checkout = { sessions: { create: mocks.checkoutCreate } };
		billingPortal = { sessions: { create: mocks.portalCreate } };
	}
}));

const user = { id: 'user-1', email: 'user@test.dev' };

function makeEvent(form: Record<string, string>, withUser = true, storedCustomer?: string) {
	const body = new FormData();
	for (const [k, v] of Object.entries(form)) body.set(k, v);
	const chain = {
		select: vi.fn(() => chain),
		eq: vi.fn(() => chain),
		maybeSingle: vi.fn(async () => ({
			data: storedCustomer ? { stripe_customer_id: storedCustomer } : null
		})),
		upsert: vi.fn(async () => ({ error: null }))
	};
	return {
		request: new Request('http://localhost:5173/api/stripe/checkout', { method: 'POST', body }),
		url: new URL('http://localhost:5173/api/stripe/checkout'),
		locals: {
			user: withUser ? user : null,
			session: withUser ? { user } : null,
			supabase: { from: vi.fn(() => chain) }
		},
		chain
	};
}

describe('POST /api/stripe/checkout', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.env.STRIPE_SECRET_KEY = 'sk_test_x';
		mocks.customersCreate.mockResolvedValue({ id: 'cus_new' });
		mocks.checkoutCreate.mockResolvedValue({ url: 'https://stripe.test/checkout/session' });
	});

	it('sends anonymous users away without touching Stripe', async () => {
		const { POST } = await import('../routes/api/stripe/checkout/+server');
		await expect(POST(makeEvent({ plan: 'pro' }, false) as never)).rejects.toThrow();
		expect(mocks.checkoutCreate).not.toHaveBeenCalled();
		expect(mocks.customersCreate).not.toHaveBeenCalled();
	});

	it('rejects unknown or free plans before any Stripe work', async () => {
		const { POST } = await import('../routes/api/stripe/checkout/+server');
		await expect(POST(makeEvent({ plan: 'nope' }) as never)).rejects.toThrow();
		await expect(POST(makeEvent({ plan: 'starter' }) as never)).rejects.toThrow();
		expect(mocks.checkoutCreate).not.toHaveBeenCalled();
	});

	it('refuses to run when Stripe is not configured', async () => {
		delete mocks.env.STRIPE_SECRET_KEY;
		const { POST } = await import('../routes/api/stripe/checkout/+server');
		await expect(POST(makeEvent({ plan: 'pro' }) as never)).rejects.toThrow();
		expect(mocks.checkoutCreate).not.toHaveBeenCalled();
	});

	it('reuses the stored customer and builds an inline-price session', async () => {
		const { POST } = await import('../routes/api/stripe/checkout/+server');
		const event = makeEvent({ plan: 'pro' }, true, 'cus_existing');

		await expect(POST(event as never)).rejects.toThrow();

		expect(mocks.customersCreate).not.toHaveBeenCalled(); // reused existing
		expect(mocks.checkoutCreate).toHaveBeenCalledTimes(1);
		const args = mocks.checkoutCreate.mock.calls[0][0];
		expect(args.mode).toBe('subscription');
		expect(args.customer).toBe('cus_existing');
		expect(args.client_reference_id).toBe('user-1');
		expect(args.line_items[0].price_data.unit_amount).toBe(1900); // Pro monthly
		expect(args.subscription_data.metadata).toMatchObject({ user_id: 'user-1', plan_id: 'pro' });
		expect(args.success_url).toContain('/app/dashboard/billing?checkout=success');
		expect(args.cancel_url).toContain('/pricing?checkout=cancelled');
	});

	it('creates and persists a customer lazily on first checkout', async () => {
		const { POST } = await import('../routes/api/stripe/checkout/+server');
		const event = makeEvent({ plan: 'enterprise' });

		await expect(POST(event as never)).rejects.toThrow();

		expect(mocks.customersCreate).toHaveBeenCalledWith({
			email: 'user@test.dev',
			metadata: { user_id: 'user-1' }
		});
		expect(event.chain.upsert).toHaveBeenCalledWith(
			expect.objectContaining({ user_id: 'user-1', stripe_customer_id: 'cus_new' })
		);
		expect(mocks.checkoutCreate.mock.calls[0][0].line_items[0].price_data.unit_amount).toBe(9900);
	});

	it('prefers configured Stripe Price IDs over inline price_data', async () => {
		mocks.env.STRIPE_PRICE_PRO = 'price_pro_123';
		const { POST } = await import('../routes/api/stripe/checkout/+server');

		await expect(POST(makeEvent({ plan: 'pro' }, true, 'cus_existing') as never)).rejects.toThrow();

		const args = mocks.checkoutCreate.mock.calls.at(-1)![0];
		expect(args.line_items[0]).toEqual({ price: 'price_pro_123', quantity: 1 });
	});
});

describe('POST /api/stripe/portal', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.env.STRIPE_SECRET_KEY = 'sk_test_x';
		mocks.portalCreate.mockResolvedValue({ url: 'https://stripe.test/portal' });
	});

	it('requires a session', async () => {
		const { POST } = await import('../routes/api/stripe/portal/+server');
		const event = {
			url: new URL('http://localhost:5173/api/stripe/portal'),
			locals: { user: null, session: null, supabase: { from: vi.fn() } }
		};
		await expect(POST(event as never)).rejects.toThrow();
		expect(mocks.portalCreate).not.toHaveBeenCalled();
	});

	it('creates a portal session for an existing customer', async () => {
		const { POST } = await import('../routes/api/stripe/portal/+server');
		const chain = {
			select: vi.fn(() => chain),
			eq: vi.fn(() => chain),
			maybeSingle: vi.fn(async () => ({ data: { stripe_customer_id: 'cus_keep' } }))
		};
		const event = {
			url: new URL('http://localhost:5173/api/stripe/portal'),
			locals: { user, session: { user }, supabase: { from: vi.fn(() => chain) } }
		};

		await expect(POST(event as never)).rejects.toThrow();

		expect(mocks.portalCreate).toHaveBeenCalledWith({
			customer: 'cus_keep',
			return_url: 'http://localhost:5173/app/dashboard/billing'
		});
	});

	it('lazily creates the customer when the mapping is missing', async () => {
		const { POST } = await import('../routes/api/stripe/portal/+server');
		const upsert = vi.fn(async () => ({ error: null }));
		const event = {
			url: new URL('http://localhost:5173/api/stripe/portal'),
			locals: {
				user,
				session: { user },
				supabase: {
					from: vi.fn(() => ({
						select: vi.fn(() => ({
							eq: vi.fn(() => ({
								maybeSingle: vi.fn(async () => ({ data: null }))
							}))
						})),
						upsert
					}))
				}
			}
		};

		await expect(POST(event as never)).rejects.toThrow();

		expect(mocks.customersCreate).toHaveBeenCalledWith({
			email: 'user@test.dev',
			metadata: { user_id: 'user-1' }
		});
		expect(upsert).toHaveBeenCalled();
		expect(mocks.portalCreate).toHaveBeenCalledTimes(1);
	});
});

describe('POST /api/stripe/checkout edge branches', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.env.STRIPE_SECRET_KEY = 'sk_test_x';
		mocks.customersCreate.mockResolvedValue({ id: 'cus_new' });
	});

	it('reports an error when Stripe returns no session url', async () => {
		mocks.checkoutCreate.mockResolvedValue({ url: null });
		const { POST } = await import('../routes/api/stripe/checkout/+server');
		await expect(POST(makeEvent({ plan: 'pro' }, true, 'cus_existing') as never)).rejects.toThrow();
	});
});

describe('POST /api/stripe/portal edge branches', () => {
	it('refuses to run when Stripe is not configured', async () => {
		const { POST } = await import('../routes/api/stripe/portal/+server');
		const event = {
			url: new URL('http://localhost:5173/api/stripe/portal'),
			locals: { user, session: { user }, supabase: { from: vi.fn() } }
		};
		await expect(POST(event as never)).rejects.toThrow();
		expect(mocks.portalCreate).not.toHaveBeenCalled();
	});
});
