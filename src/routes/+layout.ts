import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { LayoutLoad } from './$types';
import type { MetaTagsProps } from 'svelte-meta-tags';

export const load: LayoutLoad = async ({ data, depends, fetch, url }) => {
	/**
	 * Declare a dependency so the layout can be invalidated, for example, on
	 * session refresh.
	 */
	depends('supabase:auth');

	const supabase = isBrowser()
		? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
				global: {
					fetch
				},
				auth: {
					flowType: 'pkce'
				}
			})
		: createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
				global: {
					fetch
				},
				cookies: {
					getAll() {
						return data.cookies;
					}
				}
			});

	/**
	 * It's fine to use `getSession` here, because on the client, `getSession` is
	 * safe, and on the server, it reads `session` from the `LayoutData`, which
	 * safely checked the session using `safeGetSession`.
	 */
	const {
		data: { session }
	} = await supabase.auth.getSession();

	// The authGuard hook already validated the JWT (getUser) once per request;
	// reuse the user from the server layout data instead of a second round trip.
	const user = data.user;

	const rootOpenGraphImage = `${url.origin}/og-images/main.png`;

	const baseMetaTags = Object.freeze({
		title: 'SvelteKit SaaS Template',
		titleTemplate: '%s | Sveltey',
		description:
			'A comprehensive, production-ready SaaS template built with Svelte 5, SvelteKit 2, Supabase, and Skeleton UI. Launch your next SaaS project in minutes, not months.',
		canonical: new URL(url.pathname, url.origin).href,
		robots: 'index,follow',
		keywords: [
			'SvelteKit',
			'SaaS',
			'template',
			'Svelte 5',
			'Supabase',
			'Skeleton UI',
			'TypeScript',
			'authentication',
			'dashboard'
		],

		openGraph: {
			type: 'website',
			url: new URL(url.pathname, url.origin).href,
			title: 'Sveltey - SvelteKit SaaS Template',
			description:
				'A comprehensive, production-ready SaaS template built with Svelte 5, SvelteKit 2, Supabase, and Skeleton UI. Launch your next SaaS project in minutes, not months.',
			siteName: 'Sveltey',
			locale: 'en_US',
			images: [
				{
					url: rootOpenGraphImage,
					width: 1200,
					height: 630,
					alt: 'Sveltey - SvelteKit SaaS Template',
					type: 'image/png'
				}
			]
		},

		twitter: {
			cardType: 'summary_large_image' as const,
			site: '@sveltey_dev',
			creator: '@sveltey_dev',
			title: 'Sveltey - SvelteKit SaaS Template',
			description:
				'A comprehensive, production-ready SaaS template built with Svelte 5, SvelteKit 2, Supabase, and Skeleton UI.',
			// OG Images can be easily created with https://ogimagemaker.com
			image: rootOpenGraphImage,
			imageAlt: 'Sveltey - SvelteKit SaaS Template'
		},

		additionalMetaTags: [
			{
				name: 'viewport',
				content: 'width=device-width, initial-scale=1'
			},
			{
				name: 'theme-color',
				content: '#0ea5e9'
			},
			{
				name: 'application-name',
				content: 'Sveltey'
			}
		],

		additionalLinkTags: [
			{
				rel: 'icon',
				href: '/favicon.svg'
			}
		]
	}) satisfies MetaTagsProps;

	return { session, supabase, user, baseMetaTags };
};
