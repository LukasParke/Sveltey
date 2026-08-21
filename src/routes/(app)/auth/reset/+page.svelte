<script lang="ts">
	import { page } from '$app/state';
	import { supabase } from '$lib/supabase-client.js';
	import { describeAuthError, safeRedirectPath } from '$lib/auth/helpers';
	import { KeyRound, Mail } from '@lucide/svelte';

	let email = $state('');
	let loading = $state(false);
	let sent = $state(false);
	let authError = $state('');

	// Where the recovery link should land the user after the callback exchanges the code.
	const nextPath = $derived(
		safeRedirectPath(page.url.searchParams.get('next'), '/auth/update-password')
	);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		authError = '';
		loading = true;

		try {
			const redirectTo = `${page.url.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
			const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
			if (error) throw error;
			sent = true;
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
</script>

<svelte:head>
	<title>Reset Password - Sveltey</title>
	<meta name="description" content="Request a password reset link for your Sveltey account." />
</svelte:head>

<div class="container mx-auto py-20">
	<div class="mx-auto max-w-md space-y-8">
		<header class="space-y-4 text-center">
			<div class="mb-4 flex items-center justify-center gap-2">
				<KeyRound class="text-primary-500 size-8" />
				<h1 class="h1">Reset <span class="text-primary-500">Password</span></h1>
			</div>
			<p class="text-lg opacity-75">
				Enter your account email and we'll send you a link to set a new password.
			</p>
		</header>

		{#if authError}
			<div class="card preset-outlined-error-500 p-4">
				<p class="text-error-600 dark:text-error-400 text-sm">{authError}</p>
			</div>
		{/if}

		{#if sent}
			<div class="card preset-outlined-success-500 space-y-2 p-8 text-center">
				<Mail class="text-success-500 mx-auto size-10" />
				<h2 class="h4">Check your inbox</h2>
				<p class="text-sm opacity-75">
					If an account exists for <strong>{email}</strong>, we've sent a password reset link. It
					expires shortly, so use it soon.
				</p>
				<a href="/auth/login" class="btn preset-outlined-primary-500 mt-4">Back to Sign In</a>
			</div>
		{:else}
			<div class="card preset-outlined-primary-500 p-8">
				<form onsubmit={handleSubmit} class="space-y-6">
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

					<button type="submit" class="btn preset-filled-primary-500 w-full" disabled={loading}>
						{loading ? 'Sending...' : 'Send Reset Link'}
					</button>
				</form>
			</div>

			<p class="text-center text-sm opacity-75">
				Remembered it?
				<a
					href="/auth/login"
					class="text-primary-500 hover:text-primary-600 font-medium transition-colors"
				>
					Sign in here
				</a>
			</p>
		{/if}
	</div>
</div>
