import { isStripeConfigured } from '$lib/server/stripe';
import type { MetaTagsProps } from 'svelte-meta-tags';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	let subscription: { plan_id: string | null; status: string | null } | null = null;
	if (locals.user) {
		const { data } = await locals.supabase
			.from('subscriptions')
			.select('plan_id, status')
			.eq('user_id', locals.user.id)
			.maybeSingle();
		subscription = data;
	}

	const pageMetaTags = Object.freeze({
		title: 'Pricing',
		description:
			'Choose the perfect plan for your SaaS project. Flexible pricing options designed to grow with your business, from startups to enterprise.',
		openGraph: {
			title: 'Pricing Plans - Sveltey SaaS Template',
			description:
				'Choose the perfect plan for your SaaS project. Flexible pricing options designed to grow with your business.'
		}
	}) satisfies MetaTagsProps;

	return {
		stripeConfigured: isStripeConfigured(),
		session: locals.session,
		subscription,
		pageMetaTags
	};
};
