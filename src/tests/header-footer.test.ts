import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/svelte';

const pageState = vi.hoisted(() => ({
	url: new URL('http://localhost:5173/')
}));

vi.mock('$app/state', () => ({
	page: {
		get url() {
			return pageState.url;
		}
	}
}));

import Header from '$lib/components/Header.svelte';
import Footer from '$lib/components/Footer.svelte';

afterEach(cleanup);

function headerProps(session: unknown) {
	return { data: { session } };
}

describe('Header', () => {
	it('shows login/register for anonymous visitors plus Docs link', () => {
		render(Header, { props: headerProps(null) });
		const docsLinks = screen.getAllByRole('link', { name: /browse documentation/i });
		expect(docsLinks.length).toBeGreaterThanOrEqual(1);
		for (const link of docsLinks) expect(link).toHaveAttribute('href', '/docs');
		expect(screen.getAllByRole('link', { name: /login/i }).length).toBeGreaterThanOrEqual(1);
		expect(screen.getAllByRole('link', { name: /register/i }).length).toBeGreaterThanOrEqual(1);
		expect(screen.queryByRole('button', { name: /sign out/i })).toBeNull();
	});

	it('shows avatar, user name and sign-out for signed-in users', () => {
		const session = {
			user: {
				user_metadata: { full_name: 'Ada Lovelace', avatar_url: 'https://img.test/a.png' },
				email: 'ada@test.dev'
			}
		};
		render(Header, { props: headerProps(session) });
		expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
		expect(screen.getByText('ada@test.dev')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /sign out of your account/i })).toBeInTheDocument();
		expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveAttribute(
			'src',
			'https://img.test/a.png'
		);
	});
});

describe('Footer', () => {
	it('renders product, support and legal links including docs', () => {
		render(Footer);
		for (const href of ['/docs', '/pricing', '/blog', '/contact', '/privacy', '/terms']) {
			const links = screen.getAllByRole('link').filter((a) => a.getAttribute('href') === href);
			expect(links.length, href).toBeGreaterThanOrEqual(1);
		}
		expect(screen.getByRole('link', { name: 'Docs' })).toBeInTheDocument();
		expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
	});
});
