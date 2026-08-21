<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { supabase } from '$lib/supabase-client.js';
	import { toaster } from '$lib';
	import { userDisplayName } from '$lib/auth/helpers';
	import { AtSign, Calendar, Save, User } from '@lucide/svelte';

	let fullName = $state(page.data.user?.user_metadata?.full_name ?? '');
	let saving = $state(false);

	const email = $derived(page.data.user?.email ?? '');
	const memberSince = $derived(
		page.data.user?.created_at
			? new Date(page.data.user.created_at).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})
			: null
	);
	const providers = $derived(
		page.data.user?.identities?.map((identity: { provider: string }) => identity.provider) ?? [
			'email'
		]
	);
	const dirty = $derived(fullName !== (page.data.user?.user_metadata?.full_name ?? ''));

	async function handleSave(event: SubmitEvent) {
		event.preventDefault();
		saving = true;
		try {
			const { error } = await supabase.auth.updateUser({
				data: { full_name: fullName.trim() }
			});
			if (error) throw error;
			toaster.create({
				type: 'success',
				title: 'Profile updated',
				description: 'Your display name has been saved.'
			});
			await invalidateAll();
		} catch (error) {
			const messageText =
				typeof error === 'object' && error !== null && 'message' in error
					? String((error as { message: unknown }).message)
					: 'Could not update your profile.';
			toaster.create({ type: 'error', title: 'Update failed', description: messageText });
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>Profile - Sveltey</title>
	<meta name="description" content="View and manage your account profile." />
</svelte:head>

<div class="container mx-auto py-20">
	<div class="mx-auto max-w-2xl space-y-8">
		<header class="space-y-4 text-center">
			<div class="mb-4 flex items-center justify-center gap-2">
				<User class="text-primary-500 size-8" />
				<h1 class="h1">Your <span class="text-primary-500">Profile</span></h1>
			</div>
			<p class="text-lg opacity-75">Manage your personal information and account details.</p>
		</header>

		<!-- Account Card -->
		<div class="card preset-outlined-surface-500 space-y-4 p-6">
			<h2 class="h4">Account</h2>
			<div class="space-y-3 text-sm">
				<div class="flex items-center gap-3">
					<AtSign class="text-surface-500 size-4" aria-hidden="true" />
					<span class="opacity-75">Email:</span>
					<span class="font-medium">{email}</span>
				</div>
				{#if memberSince}
					<div class="flex items-center gap-3">
						<Calendar class="text-surface-500 size-4" aria-hidden="true" />
						<span class="opacity-75">Member since:</span>
						<span class="font-medium">{memberSince}</span>
					</div>
				{/if}
				<div class="flex items-center gap-3">
					<User class="text-surface-500 size-4" aria-hidden="true" />
					<span class="opacity-75">Sign-in methods:</span>
					{#each providers as provider (provider)}
						<span class="badge preset-outlined-surface-500 capitalize">{provider}</span>
					{/each}
				</div>
			</div>
		</div>

		<!-- Edit Form -->
		<div class="card preset-outlined-primary-500 p-8">
			<form onsubmit={handleSave} class="space-y-6">
				<div class="space-y-2">
					<label class="label font-medium" for="full-name">Display Name</label>
					<input
						class="input preset-outlined-surface-200-800"
						type="text"
						id="full-name"
						bind:value={fullName}
						placeholder={userDisplayName(page.data.user)}
						maxlength="100"
						disabled={saving}
					/>
					<p class="text-xs opacity-50">
						Shown in the header and across your account. Email address cannot be changed here.
					</p>
				</div>

				<button
					type="submit"
					class="btn preset-filled-primary-500 flex w-full items-center justify-center gap-2 sm:w-auto"
					disabled={saving || !dirty}
				>
					<Save class="size-4" aria-hidden="true" />
					{saving ? 'Saving...' : 'Save Changes'}
				</button>
			</form>
		</div>
	</div>
</div>
