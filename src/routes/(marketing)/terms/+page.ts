import type { MetaTagsProps } from 'svelte-meta-tags';

export const load = () => {
	const pageMetaTags = Object.freeze({
		title: 'Terms of Service',
		description:
			'Read our terms of service and understand the legal agreement between you and Sveltey for using our SaaS template.',
		openGraph: {
			title: 'Terms of Service - Sveltey',
			description: 'Read our terms of service and legal agreement for using Sveltey.'
		}
	}) satisfies MetaTagsProps;

	return {
		pageMetaTags
	};
};
