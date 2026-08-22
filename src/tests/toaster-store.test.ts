import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toaster } from '$lib/toaster.svelte';

beforeEach(() => {
	vi.useFakeTimers();
	toaster.toasts.splice(0, toaster.toasts.length);
});

afterEach(() => {
	vi.useRealTimers();
});

describe('toaster store', () => {
	it('creates toasts with defaults and returns an id', () => {
		const id = toaster.create({ title: 'Hello' });
		expect(id).toMatch(/^toast-1$/);
		expect(toaster.toasts[0]).toMatchObject({
			id,
			type: 'info',
			title: 'Hello',
			duration: 5000
		});
	});

	it('auto-dismisses after the duration', () => {
		toaster.create({ type: 'error', title: 'Boom', duration: 1000 });
		expect(toaster.toasts.length).toBe(1);
		vi.advanceTimersByTime(999);
		expect(toaster.toasts.length).toBe(1);
		vi.advanceTimersByTime(1);
		expect(toaster.toasts.length).toBe(0);
	});

	it('dismisses manually by id', () => {
		const a = toaster.create({ title: 'A' });
		const b = toaster.create({ title: 'B' });
		toaster.dismiss(a);
		expect(toaster.toasts.map((t) => t.id)).toEqual([b]);
	});

	it('caps the stack at four, dropping oldest first', () => {
		for (let i = 0; i < 6; i++) toaster.create({ title: `T${i}` });
		expect(toaster.toasts.map((t) => t.title)).toEqual(['T2', 'T3', 'T4', 'T5']);
	});

	it('supports explicit kinds and custom durations', () => {
		toaster.create({ type: 'warning', title: 'W', duration: 250 });
		expect(toaster.toasts[0].type).toBe('warning');
		vi.advanceTimersByTime(250);
		expect(toaster.toasts.length).toBe(0);
	});
});
