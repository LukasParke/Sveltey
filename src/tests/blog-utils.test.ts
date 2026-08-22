import { describe, expect, it } from 'vitest';
import {
	createPostTemplate,
	formatDate,
	generateSlug,
	getRelatedPosts,
	groupPostsByYear,
	searchPosts,
	validatePostMetadata
} from '$lib/blog-utils';
import type { BlogPostMetadata } from '$lib/blog';

const post = (over: Partial<BlogPostMetadata> = {}): BlogPostMetadata => ({
	title: 'T',
	slug: 't',
	excerpt: 'e',
	publishedAt: '2026-01-01',
	author: 'A',
	tags: ['x'],
	featured: false,
	...over
});

describe('generateSlug', () => {
	it('slugifies titles', () => {
		expect(generateSlug('Hello, World!')).toBe('hello-world');
		expect(generateSlug('  Multiple   Spaces  ')).toBe('multiple-spaces');
		expect(generateSlug('Code & Coffee — 2026')).toBe('code-coffee-2026');
	});
});

describe('formatDate', () => {
	it('formats ISO date only', () => {
		expect(formatDate(new Date('2026-03-04T12:00:00Z'))).toBe('2026-03-04');
	});
});

describe('createPostTemplate', () => {
	it('embeds title, slug and date into frontmatter', () => {
		const md = createPostTemplate('My New Post', 'Ada');
		expect(md).toContain('title: "My New Post"');
		expect(md).toContain('slug: "my-new-post"');
		expect(md).toContain('author: "Ada"');
	});
});

describe('validatePostMetadata', () => {
	it('collects every missing field', () => {
		const errors = validatePostMetadata({});
		expect(errors).toEqual([
			'Title is required',
			'Slug is required',
			'Excerpt is required',
			'Published date is required',
			'Author is required',
			'At least one tag is required'
		]);
	});

	it('rejects invalid dates', () => {
		const errors = validatePostMetadata(post({ publishedAt: 'not-a-date' }));
		expect(errors).toEqual(['Published date must be a valid date']);
	});

	it('passes valid metadata', () => {
		expect(validatePostMetadata(post())).toEqual([]);
	});
});

describe('searchPosts', () => {
	const posts = [
		post({ title: 'Stripe Guide', tags: ['payments'] }),
		post({ title: 'Theming', tags: ['design'] })
	];

	it('matches across title, excerpt, author and tags', () => {
		expect(searchPosts(posts, 'stripe').length).toBe(1);
		expect(searchPosts(posts, 'design').length).toBe(1);
	});

	it('matches everything on an empty keyword', () => {
		expect(searchPosts(posts, '').length).toBe(posts.length);
		expect(searchPosts(posts, 'STRIPE').length).toBe(1);
	});
});

describe('groupPostsByYear', () => {
	it('groups by publication year', () => {
		const grouped = groupPostsByYear([
			post({ publishedAt: '2025-06-01' }),
			post({ publishedAt: '2026-02-02' })
		]);
		expect(Object.keys(grouped).sort()).toEqual(['2025', '2026']);
	});
});

describe('getRelatedPosts', () => {
	const all = [
		post({ slug: 'a', tags: ['stripe'] }),
		post({ slug: 'b', tags: ['stripe', 'saas'] }),
		post({ slug: 'c', tags: ['themes'] })
	];

	it('scores shared tags first, then backfills recent posts', () => {
		const related = getRelatedPosts(all[0], all, 2);
		expect(related.map((r) => r.slug)).toEqual(['b', 'c']);
	});

	it('respects the limit', () => {
		expect(getRelatedPosts(all[1], all, 1).map((r) => r.slug)).toEqual(['a']);
	});
});
