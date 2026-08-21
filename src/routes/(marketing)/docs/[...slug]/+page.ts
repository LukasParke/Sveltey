import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getDocData } from '$lib/docs/engine';
import { getNeighbors, getSection } from '$lib/config/docs';
import type { MetaTagsProps } from 'svelte-meta-tags';

export const load: PageLoad = async ({ params, url }) => {
	const doc = getDocData(params.slug);
	if (!doc) {
		error(404, 'Documentation page not found');
	}

	const section = getSection(doc.meta.sectionId);
	const { prev, next } = getNeighbors(params.slug);

	const pageMetaTags: MetaTagsProps = Object.freeze({
		title: doc.meta.title,
		description: doc.description,
		canonical: new URL(`/docs/${params.slug}`, url.origin).href,
		openGraph: {
			title: `${doc.meta.title} — Sveltey Docs`,
			description: doc.description
		}
	});

	return {
		doc,
		section: section ? { id: section.id, title: section.title } : null,
		prev: prev ? { slug: prev.slug, title: prev.title } : null,
		next: next ? { slug: next.slug, title: next.title } : null,
		pageMetaTags
	};
};
