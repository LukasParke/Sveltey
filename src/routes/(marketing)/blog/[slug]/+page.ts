// src/routes/blog/[slug]/+page.server.ts
import { getPostBySlug } from '$lib/blog';
import { error } from '@sveltejs/kit';
import type { MetaTagsProps } from 'svelte-meta-tags';

export const load = async ({ params, url }) => {
	// Get the full post with content
	const post = await getPostBySlug(params.slug);

	if (!post) {
		throw error(404, 'Blog post not found');
	}

	// Create page-specific meta tags for the blog post
	const pageMetaTags = Object.freeze({
		title: post.title,
		description: post.excerpt,
		canonical: new URL(`/blog/${params.slug}`, url.origin).href,

		openGraph: {
			type: 'article',
			url: new URL(`/blog/${params.slug}`, url.origin).href,
			title: post.title,
			description: post.excerpt,
			article: {
				publishedTime: post.publishedAt,
				authors: post.author ? [post.author] : undefined,
				section: 'Technology',
				tags: ['SvelteKit', 'SaaS', 'Web Development', 'Tutorial']
			}
		},

		twitter: {
			title: post.title,
			description: post.excerpt
		},

		additionalMetaTags: [
			{
				name: 'article:published_time',
				content: post.publishedAt
			},
			{
				name: 'article:author',
				content: post.author || 'Sveltey Team'
			}
		]
	}) satisfies MetaTagsProps;

	return {
		post,
		slug: params.slug, // Pass the slug so we can load the component client-side
		pageMetaTags
	};
};
