import { describe, expect, it } from 'vitest';
import { getAllPosts, getFeaturedPosts, getPostBySlug } from '$lib/blog';

describe('blog content pipeline', () => {
	it('loads every post with complete metadata', async () => {
		const posts = await getAllPosts();
		expect(posts.length).toBeGreaterThanOrEqual(2);
		for (const post of posts) {
			expect(post.title).not.toBe('Untitled');
			expect(post.slug).toBeTruthy();
			expect(post.tags.length).toBeGreaterThan(0);
		}
	});

	it('orders posts newest first', async () => {
		const posts = await getAllPosts();
		const dates = posts.map((p) => new Date(p.publishedAt).getTime());
		expect([...dates].sort((a, b) => b - a)).toEqual(dates);
	});

	it('loads a single post with compiled content by slug', async () => {
		const all = await getAllPosts();
		const found = await getPostBySlug(all[0].slug);
		expect(found).not.toBeNull();
		expect(found!.slug).toBe(all[0].slug);
		expect(found!.content).toBeDefined();
	});

	it('returns null for unknown slugs', async () => {
		expect(await getPostBySlug('does-not-exist')).toBeNull();
	});

	it('exposes featured posts as a subset', async () => {
		const [all, featured] = [await getAllPosts(), await getFeaturedPosts()];
		expect(featured.length).toBeLessThanOrEqual(all.length);
		for (const post of featured) expect(post.featured).toBe(true);
	});
});
