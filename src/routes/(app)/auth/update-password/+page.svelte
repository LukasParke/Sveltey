<script lang="ts">
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase-client.js';
	import { describeAuthError } from '$lib/auth/helpers';
	import { Lock, ShieldCheck } from '@lucide/svelte';

	let password = $state('');
	let confirmPassword = $state('');
	let showPassword = $state(false);
	let loading = $state(false);
	let authError = $state('');

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		authError = '';

		if (password !== confirmPassword) {
			authError = 'Passwords do not match.';
			return;
		}

		loading = true;
		try {
			const { error } = await supabase.auth.updateUser({ password });
			if (error) throw error;
			await goto('/app/dashboard', { invalidateAll: true });
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
	<title>Set New Password - Sveltey</title>
	<meta name="description" content="Choose a new password for your Sveltey account." />
</svelte:head>

<div class="container mx-auto py-20">
	<div class="mx-auto max-w-md space-y-8">
		<header class="space-y-4 text-center">
			<div class="mb-4 flex items-center justify-center gap-2">
				<ShieldCheck class="text-primary-500 size-8" />
				<h1 class="h1">Set <span class="text-primary-500">New Password</span></h1>
			</div>
			<p class="text-lg opacity-75">Choose a new password for your account.</p>
		</header>

		{#if authError}
			<div class="card preset-outlined-error-500 p-4">
				<p class="text-error-600 dark:text-error-400 text-sm">{authError}</p>
			</div>
		{/if}

		<div class="card preset-outlined-primary-500 p-8">
			<form onsubmit={handleSubmit} class="space-y-6">
				<div class="space-y-2">
					<label class="label font-medium" for="password">
						<Lock class="mr-2 inline size-4" />
						New Password
					</label>
					<div class="relative">
						<input
							class="input preset-outlined-surface-200-800 pr-10"
							type={showPassword ? 'text' : 'password'}
							id="password"
							bind:value={password}
							placeholder="Create a strong password"
							required
							minlength={6}
							autocomplete="new-password"
							disabled={loading}
						/>
						<button
							type="button"
							class="text-surface-500 absolute top-1/2 right-3 -translate-y-1/2"
							onclick={() => (showPassword = !showPassword)}
							aria-label={showPassword ? 'Hide password' : 'Show password'}
						>
							{showPassword ? 'Hide' : 'Show'}
						</button>
					</div>
					<p class="text-xs opacity-50">Must be at least 6 characters long</p>
				</div>

				<div class="space-y-2">
					<label class="label font-medium" for="confirm-password">
						<Lock class="mr-2 inline size-4" />
						Confirm New Password
					</label>
					<input
						class="input preset-outlined-surface-200-800"
						type={showPassword ? 'text' : 'password'}
						id="confirm-password"
						bind:value={confirmPassword}
						placeholder="Repeat your new password"
						required
						minlength={6}
						autocomplete="new-password"
						disabled={loading}
					/>
				</div>

				<button type="submit" class="btn preset-filled-primary-500 w-full" disabled={loading}>
					{loading ? 'Updating...' : 'Update Password'}
				</button>
			</form>
		</div>
	</div>
</div>
