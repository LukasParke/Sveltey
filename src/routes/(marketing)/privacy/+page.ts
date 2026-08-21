import type { MetaTagsProps } from 'svelte-meta-tags';

export const load = () => {
	const pageMetaTags = Object.freeze({
		title: 'Privacy Policy',
		description:
			'Learn how we collect, use, and protect your personal information. Our commitment to your privacy and data security.',
		openGraph: {
			title: 'Privacy Policy - Sveltey',
			description: 'Learn how we collect, use, and protect your personal information.'
		}
	}) satisfies MetaTagsProps;

	return {
		pageMetaTags
	};
};
