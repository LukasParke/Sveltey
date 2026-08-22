import { describe, expect, it } from 'vitest';
import {
	extractHeadings,
	getAllDocMetas,
	getDocComponent,
	getDocData,
	slugifyHeading
} from '$lib/docs/engine';
import { docSections } from '$lib/config/docs';

describe('slugifyHeading', () => {
	it('matches rehype-slug output for plain headings', () => {
		expect(slugifyHeading('Getting Started')).toBe('getting-started');
		expect(slugifyHeading('What is Sveltey?')).toBe('what-is-sveltey');
		expect(slugifyHeading('Checkout & Portal')).toBe('checkout-portal');
		expect(slugifyHeading('  Trimmed  ')).toBe('trimmed');
	});

	it('strips inline code markers', () => {
		expect(slugifyHeading('The `subscriptions` table')).toBe('the-subscriptions-table');
	});
});

describe('extractHeadings', () => {
	const source = `---
title: Sample
description: ignored
---

## First Section

Text with a fenced block:

\`\`\`bash
# this comment must not appear
npm install
\`\`\`

### Subsection A

#### h4 is skipped

## Second Section
`;

	it('extracts only h2/h3 outside fences and frontmatter', () => {
		const entries = extractHeadings(source);
		expect(entries).toEqual([
			{ level: 2, text: 'First Section', id: 'first-section' },
			{ level: 3, text: 'Subsection A', id: 'subsection-a' },
			{ level: 2, text: 'Second Section', id: 'second-section' }
		]);
	});

	it('returns an empty list for heading-less pages', () => {
		expect(extractHeadings('---\ntitle: X\n---\n\nJust prose.\n')).toEqual([]);
	});
});

describe('docs engine against real content', () => {
	it('resolves every registered page with data and a component', () => {
		for (const section of docSections) {
			for (const item of section.items) {
				const data = getDocData(item.slug);
				expect(data, item.slug).not.toBeNull();
				expect(data!.meta.title).toBe(item.title);
				expect(data!.headings.length).toBeGreaterThan(0);
				expect(getDocComponent(item.slug)).not.toBeNull();
			}
		}
	});

	it('returns null for unknown slugs without throwing', () => {
		expect(getDocData('nope')).toBeNull();
		expect(getDocComponent('nope')).toBeNull();
	});

	it('registry covers exactly the on-disk markdown files', () => {
		const registered = docSections.flatMap((s) => s.items.map((i) => i.slug)).sort();
		const onDisk = getAllDocMetas()
			.map((m) => m.slug)
			.sort();
		expect(onDisk).toEqual(registered);
	});
});

describe('slugifyHeading extra branches', () => {
	it('strips punctuation while keeping letters, numbers and hyphens', () => {
		expect(slugifyHeading('v2 — Release Notes!')).toBe('v2-release-notes');
		expect(slugifyHeading('A_B c-d')).toBe('a_b-c-d');
	});
});

describe('extractHeadings CRLF handling', () => {
	it('parses CRLF documents', () => {
		const src = '---\r\ntitle: X\r\n---\r\n## Windows Heading\r\n';
		expect(extractHeadings(src)).toEqual([
			{ level: 2, text: 'Windows Heading', id: 'windows-heading' }
		]);
	});
});
