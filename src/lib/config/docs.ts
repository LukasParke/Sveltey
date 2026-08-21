/**
 * Documentation registry — single source of truth for the /docs section.
 *
 * Sections group individual pages; order here drives sidebar, landing page,
 * and previous/next navigation. Every file in src/lib/docs/*.md MUST be
 * listed exactly once (the loader warns about orphans at build/dev time).
 *
 * Products built from this template own this file: edit titles, reorder,
 * delete pages, or add entirely new sections — the routing, sidebar, TOC,
 * and pagination adapt automatically.
 */

export interface DocSection {
	id: string;
	title: string;
	description: string;
	items: { slug: string; title: string }[];
}

export interface DocMeta {
	slug: string;
	title: string;
	description: string;
	sectionId: string;
}

export const docSections: DocSection[] = [
	{
		id: 'getting-started',
		title: 'Getting Started',
		description: 'Everything you need to go from clone to running SaaS.',
		items: [
			{ slug: 'introduction', title: 'Introduction' },
			{ slug: 'installation', title: 'Installation' },
			{ slug: 'project-structure', title: 'Project Structure' },
			{ slug: 'deployment', title: 'Deployment' }
		]
	},
	{
		id: 'authentication',
		title: 'Authentication',
		description: 'Supabase auth with PKCE OAuth, email/password, and route guards.',
		items: [
			{ slug: 'authentication-overview', title: 'Overview' },
			{ slug: 'auth-flows', title: 'Auth Flows' },
			{ slug: 'protecting-routes', title: 'Protecting Routes' }
		]
	},
	{
		id: 'payments',
		title: 'Payments',
		description: 'Native Stripe subscriptions: checkout, webhooks, and the customer portal.',
		items: [
			{ slug: 'payments-overview', title: 'Overview' },
			{ slug: 'checkout-and-portal', title: 'Checkout & Portal' },
			{ slug: 'webhooks', title: 'Webhooks' },
			{ slug: 'customizing-plans', title: 'Customizing Plans' }
		]
	},
	{
		id: 'theming',
		title: 'Theming',
		description: '24 Skeleton themes, dark mode, and global token application.',
		items: [{ slug: 'theming', title: 'Theming & Dark Mode' }]
	},
	{
		id: 'content',
		title: 'Content & Email',
		description: 'MDX-style markdown for blog and docs, plus transactional email.',
		items: [
			{ slug: 'writing-docs', title: 'Writing Docs (MDX)' },
			{ slug: 'blog', title: 'Blog' },
			{ slug: 'contact-email', title: 'Contact & Email' }
		]
	},
	{
		id: 'reference',
		title: 'Reference',
		description: 'Reusable UI primitives shipped with the template.',
		items: [{ slug: 'ui-components', title: 'UI Components' }]
	}
];

export function getSection(sectionId: string): DocSection | undefined {
	return docSections.find((s) => s.id === sectionId);
}

/** Flat ordered list of every documented page. */
export function getFlatItems(): DocMeta[] {
	return docSections.flatMap((section) =>
		section.items.map((item) => ({
			slug: item.slug,
			title: item.title,
			description: '',
			sectionId: section.id
		}))
	);
}

export function getDocMeta(slug: string): DocMeta | undefined {
	return getFlatItems().find((item) => item.slug === slug);
}

/** Previous and next page relative to the given slug (nav order). */
export function getNeighbors(slug: string): {
	prev: DocMeta | null;
	next: DocMeta | null;
} {
	const flat = getFlatItems();
	const index = flat.findIndex((item) => item.slug === slug);
	return {
		prev: index > 0 ? flat[index - 1] : null,
		next: index >= 0 && index < flat.length - 1 ? flat[index + 1] : null
	};
}
