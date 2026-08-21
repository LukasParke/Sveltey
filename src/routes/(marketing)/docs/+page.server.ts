import type { PageServerLoad } from './$types';
import { docSections } from '$lib/config/docs';

export const load: PageServerLoad = async ({ url }) => {
	const pageMetaTags = {
		title: 'Documentation',
		description:
			'Complete documentation for the Sveltey SaaS template: authentication, Stripe payments, theming, blog, and deployment.',
		openGraph: {
			title: 'Sveltey Documentation',
			description: 'Everything you need to build your SaaS on Sveltey.'
		},
		canonical: new URL('/docs', url.origin).href
	};

	return { sections: docSections, pageMetaTags };
};
