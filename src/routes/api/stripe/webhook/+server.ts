import { json } from '@sveltejs/kit';
import type Stripe from 'stripe';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { getSupabaseAdmin, type SubscriptionRow } from '$lib/server/supabase-admin';
import { getPriceIdForPlan, getStripe } from '$lib/server/stripe';

/**
 * Stripe webhook receiver. Verifies signatures against the raw request body
 * and mirrors subscription state into public.subscriptions via the
 * service-role client (bypasses RLS).
 *
 * Configure: STRIPE_WEBHOOK_SECRET + a webhook endpoint pointing at
 * POST /api/stripe/webhook with events:
 *   checkout.session.completed, customer.subscription.updated,
 *   customer.subscription.deleted
 */
export const POST: RequestHandler = async ({ request }) => {
	const stripe = getStripe();
	const secret = env.STRIPE_WEBHOOK_SECRET;
	if (!stripe || !secret) {
		return json({ error: 'Stripe webhooks are not configured' }, { status: 503 });
	}

	const signature = request.headers.get('stripe-signature');
	if (!signature) {
		return json({ error: 'Missing stripe-signature header' }, { status: 400 });
	}

	const payload = await request.arrayBuffer();
	let event: Stripe.Event;
	try {
		event = await stripe.webhooks.constructEventAsync(new Uint8Array(payload), signature, secret);
	} catch (error) {
		console.error('[stripe-webhook] Signature verification failed:', error);
		return json({ error: 'Invalid signature' }, { status: 400 });
	}

	try {
		switch (event.type) {
			case 'checkout.session.completed': {
				const session = event.data.object;
				if (session.mode !== 'subscription' || typeof session.subscription !== 'string') break;
				const subscription = await stripe.subscriptions.retrieve(session.subscription);
				await mirrorSubscription(subscription, session.client_reference_id ?? null);
				break;
			}
			case 'customer.subscription.created':
			case 'customer.subscription.updated':
			case 'customer.subscription.deleted': {
				await mirrorSubscription(event.data.object, null);
				break;
			}
			default:
				// Unhandled event types are acknowledged without action.
				break;
		}
	} catch (error) {
		console.error(`[stripe-webhook] Handler failed for ${event.type}:`, error);
		return json({ error: 'Webhook handler failed' }, { status: 500 });
	}

	return json({ received: true });
};

/**
 * Upsert the subscription row for the affected user. Resolves the user from,
 * in order: explicit hint (checkout client_reference_id), subscription metadata,
 * or the stored customer mapping.
 */
async function mirrorSubscription(
	subscription: Stripe.Subscription,
	userIdHint: string | null
): Promise<void> {
	const admin = getSupabaseAdmin();
	if (!admin) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');

	const customerId =
		typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

	let userId = userIdHint ?? subscription.metadata.user_id ?? null;

	if (!userId) {
		const { data: existingRow } = await admin
			.from('subscriptions')
			.select('user_id')
			.eq('stripe_customer_id', customerId)
			.maybeSingle();
		userId = existingRow?.user_id ?? null;
	}
	if (!userId) {
		console.error(
			`[stripe-webhook] Cannot resolve user for subscription ${subscription.id} (customer ${customerId})`
		);
		return;
	}

	const priceId = subscription.items.data[0]?.price?.id ?? null;

	const row: Partial<SubscriptionRow> = {
		user_id: userId,
		stripe_customer_id: customerId,
		stripe_subscription_id: subscription.id,
		status: subscription.status,
		price_id: priceId,
		plan_id: resolvePlanId(priceId) ?? subscription.metadata.plan_id ?? null,
		current_period_end: new Date(currentPeriodEnd(subscription) * 1000).toISOString(),
		cancel_at_period_end: subscription.cancel_at_period_end
	};

	const { error } = await admin.from('subscriptions').upsert(row, { onConflict: 'user_id' });
	if (error) throw new Error(`Supabase upsert failed: ${error.message}`);
}
/**
 * stripe-node v18 (API 2025-03-31.basil) moved current_period_end from the
 * subscription object onto its items; support both shapes.
 */
function currentPeriodEnd(subscription: Stripe.Subscription): number {
	const fromItem = subscription.items.data[0]?.current_period_end;
	if (typeof fromItem === 'number') return fromItem;
	return Math.floor(Date.now() / 1000);
}

/** Map a Stripe Price ID back to a plan id using the configured env vars. */
function resolvePlanId(priceId: string | null): string | null {
	if (!priceId) return null;
	for (const plan of ['pro', 'enterprise']) {
		if (getPriceIdForPlan(plan) === priceId) return plan;
	}
	return null;
}
