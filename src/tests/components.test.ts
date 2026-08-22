import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { createRawSnippet } from 'svelte';

const pageState = vi.hoisted(() => ({
	url: new URL('http://localhost:5173/docs/installation')
}));

vi.mock('$app/state', () => ({
	page: pageState
}));

import Callout from '$lib/components/docs/Callout.svelte';
import TableOfContents from '$lib/components/docs/TableOfContents.svelte';
import DocsSidebar from '$lib/components/docs/DocsSidebar.svelte';
import Toaster from '$lib/components/Toaster.svelte';
import ThemeSwitch from '$lib/components/ThemeSwitch.svelte';
import { toaster } from '$lib/toaster.svelte';

const bodySnippet = createRawSnippet(() => ({ render: () => 'Body content' }));

afterEach(() => {
	cleanup();
	document.body.innerHTML = '';
	localStorage.clear();
});

describe('Callout', () => {
	it('renders the info default with body content', () => {
		render(Callout, { props: { children: bodySnippet } });
		expect(screen.getByText('Note')).toBeInTheDocument();
		expect(screen.getByText('Body content')).toBeInTheDocument();
	});

	it('maps kinds to default titles', () => {
		render(Callout, { props: { kind: 'danger', children: bodySnippet } });
		expect(screen.getByText('Danger')).toBeInTheDocument();
		cleanup();
		render(Callout, { props: { kind: 'success', children: bodySnippet } });
		expect(screen.getByText('Success')).toBeInTheDocument();
		cleanup();
		render(Callout, { props: { kind: 'warning', children: bodySnippet } });
		expect(screen.getByText('Warning')).toBeInTheDocument();
	});

	it('prefers an explicit title', () => {
		render(Callout, { props: { kind: 'warning', title: 'Watch out', children: bodySnippet } });
		expect(screen.getByText('Watch out')).toBeInTheDocument();
	});
});

describe('TableOfContents', () => {
	it('renders nothing without entries', () => {
		const { container } = render(TableOfContents, { props: { entries: [] } });
		expect(container.querySelector('nav')).toBeNull();
	});

	it('links every entry to its heading anchor', async () => {
		const { fireIntersection } = await import('./setup');
		for (const id of ['setup', 'advanced-notes']) {
			const el = document.createElement('h2');
			el.id = id;
			document.body.appendChild(el);
		}
		render(TableOfContents, {
			props: {
				entries: [
					{ id: 'setup', text: 'Setup', level: 2 },
					{ id: 'advanced-notes', text: 'Advanced notes', level: 3 }
				]
			}
		});
		const links = screen.getAllByRole('link');
		expect(links.map((a) => a.getAttribute('href'))).toEqual(['#setup', '#advanced-notes']);
		expect(screen.getByText('On this page')).toBeInTheDocument();

		// Scroll-spy: an intersecting heading becomes the active entry; a
		// non-intersecting batch leaves the highlight untouched.
		const setupEl = document.getElementById('setup')!;
		fireIntersection([{ target: setupEl, isIntersecting: true }]);
		const activeLink = document.querySelector('a[href="#setup"]');
		expect(activeLink?.className).toContain('border-primary-500');
		fireIntersection([{ target: setupEl, isIntersecting: false }]);
	});
});

describe('DocsSidebar', () => {
	it('renders all registered sections', () => {
		render(DocsSidebar);
		expect(screen.getByText('Getting Started')).toBeInTheDocument();
		expect(screen.getByText('Authentication')).toBeInTheDocument();
		expect(screen.getByText('Payments')).toBeInTheDocument();
		expect(screen.getByText('Theming')).toBeInTheDocument();
		expect(screen.getByText('Content & Email')).toBeInTheDocument();
		expect(screen.getByText('Reference')).toBeInTheDocument();
	});

	it('marks the current page as active', () => {
		const { container } = render(DocsSidebar);
		const current = container.querySelector('a[aria-current="page"]');
		expect(current?.textContent?.trim()).toBe('Installation');
		expect(container.querySelector('a[href="/docs/ui-components"]')).not.toBeNull();
	});
});

describe('Toaster', () => {
	beforeEach(() => {
		toaster.toasts.splice(0, toaster.toasts.length);
	});

	it('shows created toasts with type metadata and dismisses on click', async () => {
		const user = userEvent.setup();
		render(Toaster);

		toaster.create({ type: 'success', title: 'Saved!', description: 'All good' });
		const status = await screen.findByRole('status');
		expect(status).toHaveAttribute('data-toast-type', 'success');
		expect(screen.getByText('Saved!')).toBeInTheDocument();
		expect(screen.getByText('All good')).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: /dismiss/i }));
		expect(screen.queryByRole('status')).toBeNull();
	});

	it('caps visible toasts at four, dropping the oldest', async () => {
		render(Toaster);
		for (let i = 0; i < 6; i++) toaster.create({ type: 'info', title: `Toast ${i}` });
		const statuses = await screen.findAllByRole('status');
		expect(statuses.length).toBe(4);
		expect(toaster.toasts.map((t) => t.title)).toEqual([
			'Toast 2',
			'Toast 3',
			'Toast 4',
			'Toast 5'
		]);
	});
});

describe('ThemeSwitch', () => {
	it('toggles dark mode and persists the choice', async () => {
		localStorage.clear();
		const user = userEvent.setup();
		render(ThemeSwitch);

		await user.click(screen.getByRole('button', { name: /toggle light\/dark mode/i }));
		expect(document.documentElement.classList.contains('dark')).toBe(false);
		expect(localStorage.getItem('darkMode')).toBe('false');

		await user.click(screen.getByRole('button', { name: /toggle light\/dark mode/i }));
		expect(document.documentElement.classList.contains('dark')).toBe(true);
		expect(localStorage.getItem('darkMode')).toBe('true');
	});

	it('selects a color theme from the dropdown and persists it', async () => {
		localStorage.clear();
		const user = userEvent.setup();
		render(ThemeSwitch);

		await user.click(screen.getByRole('button', { name: /select color theme/i }));
		await user.click(screen.getByRole('button', { name: /select dracula theme/i }));
		expect(document.body.getAttribute('data-theme')).toBe('dracula');
		expect(localStorage.getItem('colorTheme')).toBe('dracula');
	});
});
