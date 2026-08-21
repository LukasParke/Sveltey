import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

/**
 * Lazily construct a Stripe client from STRIPE_SECRET_KEY.
 * Returns null when payments are not configured so callers can degrade
 * gracefully (disabled buttons, setup banners) instead of crashing.
 */
export function getStripe(): Stripe | null {
	const key = env.STRIPE_SECRET_KEY;
	if (!key) return null;
	return new Stripe(key);
}

export function isStripeConfigured(): boolean {
	return Boolean(env.STRIPE_SECRET_KEY);
}

/**
 * Resolve the Stripe Price ID for a plan. Prefers configured Price IDs
 * (STRIPE_PRICE_<PLAN_ID_UPPERCASE>); returns null to signal inline price_data.
 */
export function getPriceIdForPlan(planId: string): string | null {
	const envKey = `STRIPE_PRICE_${planId.toUpperCase()}`;
	return env[envKey] ?? null;
}
