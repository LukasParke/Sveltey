import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPlanById } from '$lib/config/plans';
import { getPriceIdForPlan, getStripe } from '$lib/server/stripe';

/**
 * Creates a Stripe Checkout Session for a paid plan and redirects to it.
 * Works without JS (plain form POST). Unauthenticated users are sent to
 * registration with ?next=/pricing so they land back on the plans after signup.
 */
export const POST: RequestHandler = async ({ request, url, locals }) => {
	const formData = await request.formData();
	const planId = typeof formData.get('plan') === 'string' ? (formData.get('plan') as string) : '';
	const plan = getPlanById(planId);

	if (!plan || plan.priceCents === 0) {
		redirect(303, '/pricing?checkout=invalid_plan');
	}

	// locals.session is guaranteed non-null for /app routes by the authGuard,
	// but /api is open — enforce auth here explicitly.
	const user = locals.user;
	if (!user) {
		redirect(303, `/auth/register?next=${encodeURIComponent('/pricing')}`);
	}

	const stripe = getStripe();
	if (!stripe) {
		redirect(303, '/pricing?checkout=not_configured');
	}

	// Reuse the Stripe customer across sessions; create one lazily otherwise.
	const { data: existingRow } = await locals.supabase
		.from('subscriptions')
		.select('stripe_customer_id')
		.eq('user_id', user.id)
		.maybeSingle();
	let customerId = existingRow?.stripe_customer_id ?? null;
	if (!customerId) {
		const customer = await stripe.customers.create({
			email: user.email,
			metadata: { user_id: user.id }
		});
		customerId = customer.id;
		await locals.supabase.from('subscriptions').upsert({
			user_id: user.id,
			stripe_customer_id: customerId
		});
	}

	const priceId = getPriceIdForPlan(plan.id);
	const lineItem = priceId
		? { price: priceId, quantity: 1 }
		: {
				quantity: 1,
				price_data: {
					currency: 'usd',
					unit_amount: plan.priceCents,
					recurring: { interval: 'month' as const },
					product_data: { name: `Sveltey ${plan.name} plan` }
				}
			};

	const session = await stripe.checkout.sessions.create({
		mode: 'subscription',
		customer: customerId,
		client_reference_id: user.id,
		line_items: [lineItem],
		metadata: { user_id: user.id, plan_id: plan.id },
		subscription_data: { metadata: { user_id: user.id, plan_id: plan.id } },
		success_url: `${url.origin}/app/dashboard/billing?checkout=success`,
		cancel_url: `${url.origin}/pricing?checkout=cancelled`
	});

	if (!session.url) {
		redirect(303, '/pricing?checkout=error');
	}
	redirect(303, session.url);
};
