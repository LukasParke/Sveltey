<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { supabase } from '$lib/supabase-client.js';
	import { toaster } from '$lib';
	import { describeAuthError, extractAuthErrorParams, safeRedirectPath } from '$lib/auth/helpers';
	import {
		AlertTriangle,
		Chrome,
		Eye,
		EyeOff,
		Github,
		Lock,
		LogIn,
		Mail,
		MessageCircle,
		Twitter,
		UserPlus
	} from '@lucide/svelte';

	interface Props {
		mode: 'login' | 'register';
	}

	let { mode }: Props = $props();

	const isLogin = mode === 'login';

	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let loading = $state(false);
	let oauthLoading = $state('');
	let authError = $state('');
	let infoMessage = $state('');

	// Post-auth redirect target (?next=/path), validated against open redirects.
	const redirectTo = $derived(safeRedirectPath(page.url.searchParams.get('next')));

	// Surface auth errors passed back by the /auth/callback route or the provider.
	$effect(() => {
		const params = extractAuthErrorParams(page.url.searchParams, '');
		if (params.error) {
			authError = describeAuthError(params.errorCode, params.errorDescription);
		}
	});

	// OAuth providers: enable more by configuring them in your Supabase dashboard
	// (Authentication > Providers), then flipping `enabled` here.
	const oauthProviders = [
		{
			name: 'GitHub',
			provider: 'github',
			icon: Github,
			color: 'bg-[#333] hover:bg-[#555] text-white',
			description: isLogin ? 'Continue with GitHub' : 'Sign up with GitHub',
			enabled: true
		},
		{
			name: 'Google',
			provider: 'google',
			icon: Chrome,
			color: 'bg-surface-100-800 text-surface-600-400 cursor-not-allowed opacity-60',
			description: 'Continue with Google',
			enabled: false
		},
		{
			name: 'Discord',
			provider: 'discord',
			icon: MessageCircle,
			color: 'bg-surface-100-800 text-surface-600-400 cursor-not-allowed opacity-60',
			description: 'Continue with Discord',
			enabled: false
		},
		{
			name: 'Twitter',
			provider: 'twitter',
			icon: Twitter,
			color: 'bg-surface-100-800 text-surface-600-400 cursor-not-allowed opacity-60',
			description: 'Continue with Twitter',
			enabled: false
		}
	];

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		authError = '';
		infoMessage = '';
		loading = true;

		try {
			if (isLogin) {
				const { error } = await supabase.auth.signInWithPassword({ email, password });
				if (error) throw error;
				await goto(redirectTo, { invalidateAll: true });
			} else {
				const { data, error } = await supabase.auth.signUp({
					email,
					password,
					options: {
						emailRedirectTo: `${page.url.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
					}
				});
				if (error) throw error;

				if (data.session) {
					// Email confirmation disabled: signed in immediately.
					await goto(redirectTo, { invalidateAll: true });
				} else {
					// Email confirmation enabled: ask the user to verify.
					infoMessage =
						'Account created! Check your inbox for a confirmation link to activate your account.';
					email = '';
					password = '';
				}
			}
		} catch (error) {
			const code =
				typeof error === 'object' && error !== null && 'code' in error
					? String((error as { code: unknown }).code)
					: null;
			const messageText =
				typeof error === 'object' && error !== null && 'message' in error
					? String((error as { message: unknown }).message)
					: null;
			authError = describeAuthError(code, messageText);
		} finally {
			loading = false;
		}
	}

	async function handleOAuth(provider: string) {
		const config = oauthProviders.find((p) => p.provider === provider);
		if (!config?.enabled) {
			toaster.create({
				type: 'info',
				title: `${config?.name ?? provider} sign-in`,
				description: `Enable the ${config?.name ?? provider} provider in your Supabase dashboard (Authentication > Providers), then set enabled: true in AuthForm.svelte.`
			});
			return;
		}

		authError = '';
		oauthLoading = provider;
		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: provider as 'github',
				options: {
					redirectTo: `${page.url.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
				}
			});
			if (error) throw error;
		} catch (error) {
			const messageText =
				typeof error === 'object' && error !== null && 'message' in error
					? String((error as { message: unknown }).message)
					: null;
			authError = describeAuthError(null, messageText);
			oauthLoading = '';
		}
	}
</script>

{#if authError}
	<div class="card preset-outlined-error-500 p-4">
		<div class="flex items-start gap-3">
			<AlertTriangle class="text-error-500 mt-0.5 size-5 flex-shrink-0" />
			<div class="flex-1 space-y-2">
				<h3 class="text-error-700 dark:text-error-300 font-semibold">Authentication Failed</h3>
				<p class="text-error-600 dark:text-error-400 text-sm">{authError}</p>
				<button
					type="button"
					class="text-error-500 hover:text-error-600 text-xs underline"
					onclick={() => (authError = '')}
				>
					Dismiss
				</button>
			</div>
		</div>
	</div>
{/if}

{#if infoMessage}
	<div class="card preset-outlined-success-500 p-4 text-center">
		<p class="text-success-600 dark:text-success-400 text-sm">{infoMessage}</p>
	</div>
{/if}

<div class="card preset-outlined-primary-500 space-y-6 p-8">
	<!-- Email/Password Form -->
	<form onsubmit={handleSubmit} class="space-y-6">
		<div class="space-y-4">
			<div class="space-y-2">
				<label class="label font-medium" for="email">
					<Mail class="mr-2 inline size-4" />
					Email Address
				</label>
				<input
					class="input preset-outlined-surface-200-800"
					type="email"
					id="email"
					bind:value={email}
					placeholder="you@example.com"
					required
					autocomplete="email"
					disabled={loading}
				/>
			</div>

			<div class="space-y-2">
				<label class="label font-medium" for="password">
					<Lock class="mr-2 inline size-4" />
					Password
				</label>
				<div class="relative">
					<input
						class="input preset-outlined-surface-200-800 pr-10"
						type={showPassword ? 'text' : 'password'}
						id="password"
						bind:value={password}
						placeholder={isLogin ? 'Your password' : 'Create a strong password'}
						required
						minlength={isLogin ? undefined : 6}
						autocomplete={isLogin ? 'current-password' : 'new-password'}
						disabled={loading}
					/>
					<button
						type="button"
						class="text-surface-500 absolute top-1/2 right-3 -translate-y-1/2"
						onclick={() => (showPassword = !showPassword)}
						aria-label={showPassword ? 'Hide password' : 'Show password'}
						title={showPassword ? 'Hide password' : 'Show password'}
					>
						{#if showPassword}
							<EyeOff class="size-4" />
						{:else}
							<Eye class="size-4" />
						{/if}
					</button>
				</div>
				{#if !isLogin}
					<p class="text-xs opacity-50">Must be at least 6 characters long</p>
				{/if}
			</div>
		</div>

		<button
			type="submit"
			class="btn preset-filled-primary-500 flex w-full items-center justify-center gap-2"
			disabled={loading || oauthLoading !== ''}
		>
			{#if loading}
				<div
					class="h-4 w-4 animate-spin rounded-full border-b-2 border-current"
					aria-hidden="true"
				></div>
				{isLogin ? 'Signing In...' : 'Creating Account...'}
			{:else if isLogin}
				<LogIn class="size-4" />
				<span>Sign In</span>
			{:else}
				<UserPlus class="size-4" />
				<span>Create Account</span>
			{/if}
		</button>

		{#if isLogin}
			<p class="text-center text-sm">
				<a href="/auth/reset" class="text-primary-500 hover:text-primary-600 transition-colors">
					Forgot your password?
				</a>
			</p>
		{/if}
	</form>

	<!-- Terms Notice -->
	{#if !isLogin}
		<p class="text-center text-xs opacity-50">
			By creating an account, you agree to our
			<a href="/terms" class="text-primary-500 hover:text-primary-600 transition-colors"
				>Terms of Service</a
			>
			and
			<a href="/privacy" class="text-primary-500 hover:text-primary-600 transition-colors"
				>Privacy Policy</a
			>.
		</p>
	{/if}

	<!-- Divider -->
	<div class="flex items-center">
		<hr class="flex-grow opacity-30" />
		<span class="px-4 text-sm opacity-50">or continue with</span>
		<hr class="flex-grow opacity-30" />
	</div>

	<!-- OAuth Providers -->
	<div class="space-y-3">
		{#each oauthProviders as provider (provider.provider)}
			<button
				type="button"
				class="btn flex w-full items-center justify-center gap-3 {provider.color}"
				onclick={() => handleOAuth(provider.provider)}
				disabled={!provider.enabled || loading || oauthLoading !== ''}
				aria-label={provider.description}
				title={provider.enabled
					? provider.description
					: `${provider.name} sign-in is not configured. Enable it in your Supabase dashboard.`}
			>
				{#if oauthLoading === provider.provider}
					<div
						class="h-4 w-4 animate-spin rounded-full border-b-2 border-current"
						aria-hidden="true"
					></div>
					Connecting...
				{:else}
					<provider.icon class="size-4" aria-hidden="true" />
					{provider.description}
				{/if}
			</button>
		{/each}
	</div>
</div>

<!-- Footer Links -->
<div class="space-y-4 text-center">
	<p class="text-sm opacity-75">
		{#if isLogin}
			Don't have an account?
			<a
				href="/auth/register"
				class="text-primary-500 hover:text-primary-600 font-medium transition-colors"
			>
				Create one here
			</a>
		{:else}
			Already have an account?
			<a
				href="/auth/login"
				class="text-primary-500 hover:text-primary-600 font-medium transition-colors"
			>
				Sign in here
			</a>
		{/if}
	</p>
	<div class="flex items-center justify-center gap-4 text-sm opacity-50">
		<a href="/privacy" class="transition-opacity hover:opacity-75">Privacy Policy</a>
		<span>•</span>
		<a href="/terms" class="transition-opacity hover:opacity-75">Terms of Service</a>
	</div>
</div>
