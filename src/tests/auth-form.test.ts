import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => ({
	url: new URL('http://localhost:5173/auth/login'),
	goto: vi.fn(),
	signInWithPassword: vi.fn(),
	signUp: vi.fn(),
	signInWithOAuth: vi.fn()
}));

vi.mock('$app/state', () => ({
	page: {
		get url() {
			return mocks.url;
		}
	}
}));
vi.mock('$app/navigation', () => ({ goto: mocks.goto }));
vi.mock('$lib/supabase-client.js', () => ({
	supabase: { auth: mocks }
}));
vi.mock('$lib/supabase-client', () => ({
	supabase: { auth: mocks }
}));

import AuthForm from '$lib/components/auth/AuthForm.svelte';
import { toaster } from '$lib/toaster.svelte';

function setUrl(path: string, search = '') {
	mocks.url = new URL(`http://localhost:5173${path}${search}`);
}

beforeEach(() => {
	cleanup();
	setUrl('/auth/login');
	vi.clearAllMocks();
	toaster.toasts.splice(0, toaster.toasts.length);
	mocks.signInWithPassword.mockResolvedValue({ data: { session: {} }, error: null });
	mocks.signUp.mockResolvedValue({ data: { session: {}, user: {} }, error: null });
	mocks.signInWithOAuth.mockResolvedValue({ data: {}, error: null });
});

async function fillAndSubmit(email = 'ada@test.dev', password = 'secret123') {
	render(AuthForm, { props: { mode: 'login' } });
	const user = userEvent.setup();
	await user.type(screen.getByLabelText('Email Address'), email);
	await user.type(screen.getByLabelText('Password'), password);
	await user.click(screen.getByRole('button', { name: /^sign in/i }));
}

describe('AuthForm — login mode', () => {
	it('renders email/password fields and a GitHub OAuth button', () => {
		render(AuthForm, { props: { mode: 'login' } });
		expect(screen.getByLabelText(/email address/i)).toBeEnabled();
		expect(screen.getByRole('button', { name: /continue with github/i })).toBeEnabled();
		expect(screen.getByRole('button', { name: /continue with google/i })).toBeDisabled();
		expect(screen.getByRole('link', { name: /forgot your password/i })).toHaveAttribute(
			'href',
			'/auth/reset'
		);
	});

	it('signs in and navigates to the validated next target', async () => {
		setUrl('/auth/login', '?next=%2Fpricing');
		await fillAndSubmit();
		await waitFor(() => expect(mocks.signInWithPassword).toHaveBeenCalledTimes(1));
		await waitFor(() =>
			expect(mocks.signInWithPassword).toHaveBeenCalledWith({
				email: 'ada@test.dev',
				password: 'secret123'
			})
		);
		await waitFor(() => expect(mocks.goto).toHaveBeenCalledWith('/pricing', expect.anything()));
	});

	it('shows a friendly error on invalid credentials', async () => {
		mocks.signInWithPassword.mockRejectedValue({
			code: 'invalid_credentials',
			message: 'Invalid login credentials'
		});
		await fillAndSubmit('wrong@test.dev', 'nope');
		await waitFor(() => expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument());
		expect(mocks.goto).not.toHaveBeenCalled();
	});

	it('surfaces callback errors passed through the URL', async () => {
		setUrl('/auth/login', '?error=invalid_request&error_description=Link+expired');
		render(AuthForm, { props: { mode: 'login' } });
		await waitFor(() => {});
		expect(await screen.findByText(/Link expired/i)).toBeInTheDocument();
	});
});

describe('AuthForm — register mode', () => {
	it('renders registration copy and terms links', () => {
		setUrl('/auth/register');
		render(AuthForm, { props: { mode: 'register' } });
		expect(screen.getByRole('button', { name: /create account/i })).toBeEnabled();
		expect(screen.getByText(/By creating an account/i)).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /sign in here/i })).toHaveAttribute(
			'href',
			'/auth/login'
		);
	});

	it('asks for email confirmation when no session is returned', async () => {
		setUrl('/auth/register');
		mocks.signUp.mockResolvedValue({ data: { session: null, user: null }, error: null });
		render(AuthForm, { props: { mode: 'register' } });
		const user = userEvent.setup();
		await user.type(screen.getByLabelText('Email Address'), 'new@test.dev');
		await user.type(screen.getByLabelText('Password'), 'secret123');
		await user.click(screen.getByRole('button', { name: /create account/i }));

		await waitFor(() =>
			expect(mocks.signUp).toHaveBeenCalledWith({
				email: 'new@test.dev',
				password: 'secret123',
				options: { emailRedirectTo: expect.stringContaining('/auth/callback') }
			})
		);
		await waitFor(() =>
			expect(screen.getByText(/Check your inbox for a confirmation link/i)).toBeInTheDocument()
		);
		expect(mocks.goto).not.toHaveBeenCalled();
	});

	it('navigates straight to the dashboard when confirmation is disabled', async () => {
		setUrl('/auth/register');
		render(AuthForm, { props: { mode: 'register' } });
		const user = userEvent.setup();
		await user.type(screen.getByLabelText('Email Address'), 'new@test.dev');
		await user.type(screen.getByLabelText('Password'), 'secret123');
		await user.click(screen.getByRole('button', { name: /create account/i }));

		await waitFor(() =>
			expect(mocks.goto).toHaveBeenCalledWith('/app/dashboard', expect.anything())
		);
	});
});

describe('AuthForm — OAuth', () => {
	it('starts the OAuth flow for enabled providers with a callback redirect', async () => {
		const user = userEvent.setup();
		render(AuthForm, { props: { mode: 'login' } });
		await user.click(screen.getByRole('button', { name: /continue with github/i }));

		await waitFor(() =>
			expect(mocks.signInWithOAuth).toHaveBeenCalledWith({
				provider: 'github',
				options: { redirectTo: expect.stringContaining('/auth/callback') }
			})
		);
	});

	it('toasts guidance for providers that are not configured', async () => {
		const createSpy = vi.spyOn(toaster, 'create');
		render(AuthForm, { props: { mode: 'login' } });
		fireEvent.click(screen.getByRole('button', { name: /continue with google/i }));

		expect(mocks.signInWithOAuth).not.toHaveBeenCalled();
		expect(createSpy).toHaveBeenCalledWith(
			expect.objectContaining({ type: 'info', title: expect.stringContaining('Google') })
		);
		createSpy.mockRestore();
	});

	it('shows an auth error when the provider fails', async () => {
		mocks.signInWithOAuth.mockRejectedValue({ message: 'provider down' });
		const user = userEvent.setup();
		render(AuthForm, { props: { mode: 'login' } });
		await user.click(screen.getByRole('button', { name: /continue with github/i }));

		await waitFor(() => expect(screen.getByText(/provider down/i)).toBeInTheDocument());
	});

	it('toggles password visibility', async () => {
		const user = userEvent.setup();
		render(AuthForm, { props: { mode: 'login' } });
		const password = screen.getByLabelText('Password');
		expect(password).toHaveAttribute('type', 'password');
		await user.click(screen.getByRole('button', { name: /show password/i }));
		expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
	});

	it('dismisses the auth error banner', async () => {
		setUrl(
			'/auth/login',
			'?error=access_denied&error_description=Access+was+denied+by+the+provider'
		);
		const user = userEvent.setup();
		render(AuthForm, { props: { mode: 'login' } });
		await waitFor(() => {});
		const banner = await screen.findByText(/denied by the provider/i);
		void banner;
		const dismiss = await screen.findByRole('button', { name: /dismiss/i });
		await user.click(dismiss);
		await waitFor(() => expect(screen.queryByText(/denied by the provider/i)).toBeNull());
	});
});
