/**
 * Docs engine: loads MDX-style markdown (via mdsvex) from src/lib/docs/*.md,
 * extracts frontmatter metadata and table-of-contents entries from raw source.
 *
 * Modules are imported eagerly so compiled components resolve synchronously —
 * loads stay fully serializable (components never pass through load data).
 *
 * Generic by design — products built on this template can reuse this module
 * for their own documentation by pointing the glob at any markdown directory.
 */
import { getDocMeta, getFlatItems, type DocMeta } from '$lib/config/docs';

export interface TocEntry {
	id: string;
	text: string;
	level: 2 | 3;
}

export interface DocPageData {
	meta: DocMeta;
	description: string;
	headings: TocEntry[];
}

interface CompiledModule {
	default: unknown;
	metadata?: Record<string, string>;
}

const docModules = import.meta.glob('$lib/docs/*.md', { eager: true }) as Record<
	string,
	CompiledModule
>;
const docSources = import.meta.glob('$lib/docs/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

/** GitHub-style slugger matching rehype-slug output for plain-text headings. */
export function slugifyHeading(text: string): string {
	return text
		.trim()
		.toLowerCase()
		.replace(/[`*_~[\]()]/g, '')
		.replace(/[^\p{L}\p{N}\s-]/gu, '')
		.replace(/\s+/g, '-');
}

/** Metadata for every documented page, in registry order. Warns about drift. */
export function getAllDocMetas(): DocMeta[] {
	for (const key of Object.keys(docSources)) {
		const slug = key.replace('/src/lib/docs/', '').replace('.md', '');
		if (!getDocMeta(slug)) {
			console.warn(
				`[docs] File "${slug}.md" exists but is not listed in config/docs.ts — it will 404.`
			);
		}
	}
	return getFlatItems();
}

/**
 * Extract h2/h3 entries from raw markdown for the "On this page" rail.
 * Frontmatter and fenced code blocks are ignored so code samples containing
 * `#` comments never leak into the TOC.
 */
export function extractHeadings(source: string): TocEntry[] {
	const withoutFrontmatter = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
	const entries: TocEntry[] = [];
	let inFence = false;

	for (const line of withoutFrontmatter.split('\n')) {
		if (/^\s*```/.test(line)) {
			inFence = !inFence;
			continue;
		}
		if (inFence) continue;
		const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
		if (!match) continue;
		const text = match[2].replace(/[`*]/g, '');
		entries.push({ level: match[1].length as 2 | 3, text, id: slugifyHeading(text) });
	}
	return entries;
}

/** Compiled markdown component for a slug (synchronous, no load round trip). */
export function getDocComponent(slug: string): unknown | null {
	return docModules[`/src/lib/docs/${slug}.md`]?.default ?? null;
}

/** Serializable per-page payload: metadata, description, and TOC entries. */
export function getDocData(slug: string): DocPageData | null {
	const meta = getDocMeta(slug);
	const mod = docModules[`/src/lib/docs/${slug}.md`];
	const source = docSources[`/src/lib/docs/${slug}.md`];
	if (!meta || !mod || !source) return null;

	return {
		meta,
		description: mod.metadata?.description ?? meta.description ?? '',
		headings: extractHeadings(source)
	};
}
