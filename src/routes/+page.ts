import type { MetaTagsProps } from 'svelte-meta-tags';

export const load = () => {
	const pageMetaTags = Object.freeze({
		title: 'Home',
		description:
			'Launch your SaaS project with a comprehensive SvelteKit template. Built with Svelte 5, Supabase authentication, modern UI components, and everything you need to get started.',
		openGraph: {
			title: 'Launch Your SaaS Project Fast',
			description:
				'Launch your SaaS project with a comprehensive SvelteKit template. Built with Svelte 5, Supabase authentication, modern UI components, and everything you need to get started.'
		}
	}) satisfies MetaTagsProps;

	return {
		pageMetaTags
	};
};
