import type { MetaTagsProps } from 'svelte-meta-tags';

export const load = () => {
	const pageMetaTags = Object.freeze({
		title: 'Contact Us',
		description:
			"Get in touch with our team. We're here to help you succeed with your SaaS project and answer any questions you may have.",
		openGraph: {
			title: 'Contact Us - Sveltey',
			description:
				"Get in touch with our team. We're here to help you succeed with your SaaS project."
		}
	}) satisfies MetaTagsProps;

	return {
		pageMetaTags
	};
};
