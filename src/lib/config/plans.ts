/**
 * Single source of truth for subscription plans.
 *
 * Prices are monthly amounts in USD. Paid plans are billed through Stripe:
 * - Set STRIPE_PRICE_PRO / STRIPE_PRICE_ENTERPRISE to existing Stripe Price IDs
 *   (recommended for production).
 * - Without Price IDs, checkout falls back to inline `price_data` using the
 *   amounts below, so the template works out of the box with test keys.
 */
export interface PlanFeature {
	name: string;
	included: boolean;
}

export interface Plan {
	id: string;
	name: string;
	description: string;
	/** Monthly price in USD cents. 0 = free tier. */
	priceCents: number;
	features: PlanFeature[];
	popular: boolean;
}

export const plans: Plan[] = [
	{
		id: 'starter',
		name: 'Starter',
		description: 'Perfect for side projects and getting started',
		priceCents: 0,
		features: [
			{ name: 'Up to 3 projects', included: true },
			{ name: 'Basic analytics', included: true },
			{ name: 'Community support', included: true },
			{ name: 'Advanced integrations', included: false },
			{ name: 'Priority support', included: false },
			{ name: 'Custom domains', included: false }
		],
		popular: false
	},
	{
		id: 'pro',
		name: 'Pro',
		description: 'Best for growing businesses and teams',
		priceCents: 1900,
		features: [
			{ name: 'Unlimited projects', included: true },
			{ name: 'Advanced analytics', included: true },
			{ name: 'Priority support', included: true },
			{ name: 'Advanced integrations', included: true },
			{ name: 'Custom domains', included: true },
			{ name: 'Team collaboration', included: false }
		],
		popular: false
	},
	{
		id: 'enterprise',
		name: 'Enterprise',
		description: 'For large teams with advanced needs',
		priceCents: 9900,
		features: [
			{ name: 'Everything in Pro', included: true },
			{ name: 'Team collaboration', included: true },
			{ name: 'Advanced security', included: true },
			{ name: 'Custom integrations', included: true },
			{ name: 'Dedicated support', included: true },
			{ name: 'SLA guarantee', included: true }
		],
		popular: false
	}
];

export function getPlanById(id: string | null | undefined): Plan | undefined {
	return plans.find((p) => p.id === id);
}

export function formatPrice(priceCents: number): string {
	if (priceCents === 0) return '$0';
	return `$${Math.round(priceCents / 100)}`;
}
