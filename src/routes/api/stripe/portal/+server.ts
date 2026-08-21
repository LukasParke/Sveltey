import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getStripe } from '$lib/server/stripe';

/**
 * Opens the Stripe Customer Portal for the signed-in user, creating the
 * Stripe customer lazily if they have never checked out.
 */
export const POST: RequestHandler = async ({ url, locals }) => {
	const user = locals.user;
	if (!user) {
		redirect(303, `/auth/login?next=${encodeURIComponent('/app/dashboard/billing')}`);
	}

	const stripe = getStripe();
	if (!stripe) {
		redirect(303, '/app/dashboard/billing?error=not_configured');
	}

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

	const portalSession = await stripe.billingPortal.sessions.create({
		customer: customerId,
		return_url: `${url.origin}/app/dashboard/billing`
	});

	redirect(303, portalSession.url);
};
