import type { MetaTagsProps } from 'svelte-meta-tags';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ data }) => {
	const pageMetaTags = Object.freeze({
		title: 'Blog',
		description:
			'Learn about SaaS development, SvelteKit tutorials, and best practices for building modern web applications.',
		openGraph: {
			title: 'Blog - Sveltey SaaS Template',
			description:
				'Learn about SaaS development, SvelteKit tutorials, and best practices for building modern web applications.'
		}
	}) satisfies MetaTagsProps;

	return {
		...data,
		pageMetaTags
	};
};
