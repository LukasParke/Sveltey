import { describe, expect, it } from 'vitest';
import { formatPrice, getPlanById } from '$lib/config/plans';
import { docSections, getDocMeta, getFlatItems, getNeighbors, getSection } from '$lib/config/docs';

describe('plans config', () => {
	it('finds plans by id and misses unknown ids', () => {
		expect(getPlanById('pro')?.name).toBe('Pro');
		expect(getPlanById('nope')).toBeUndefined();
		expect(getPlanById(null)).toBeUndefined();
	});

	it('formats prices as dollars', () => {
		expect(formatPrice(0)).toBe('$0');
		expect(formatPrice(1900)).toBe('$19');
		expect(formatPrice(9950)).toBe('$100'); // rounds
	});
});

describe('docs config', () => {
	it('has unique slugs across all sections', () => {
		const slugs = docSections.flatMap((s) => s.items.map((i) => i.slug));
		expect(new Set(slugs).size).toBe(slugs.length);
	});

	it('resolves sections and metadata', () => {
		expect(getSection('authentication')?.title).toBe('Authentication');
		expect(getSection('missing')).toBeUndefined();
		expect(getDocMeta('installation')?.title).toBe('Installation');
	});

	it('flattens items in registry order', () => {
		const flat = getFlatItems();
		expect(flat[0].slug).toBe('introduction');
		expect(flat.length).toBeGreaterThanOrEqual(16);
	});

	it('computes prev/next neighbors across section boundaries', () => {
		const { prev, next } = getNeighbors('deployment');
		expect(prev?.slug).toBe('project-structure');
		expect(next?.slug).toBe('authentication-overview');
	});

	it('returns nulls for the first and last pages', () => {
		expect(getNeighbors('introduction').prev).toBeNull();
		const last = docSections.at(-1)!.items.at(-1)!.slug;
		expect(getNeighbors(last).next).toBeNull();
	});
});
