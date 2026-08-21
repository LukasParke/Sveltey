<script lang="ts">
	import AuthForm from '$lib/components/auth/AuthForm.svelte';
	import { LogIn } from '@lucide/svelte';
</script>

<svelte:head>
	<title>Sign In - Sveltey</title>
	<meta
		name="description"
		content="Sign in to your account to access your dashboard and manage your projects."
	/>
</svelte:head>

<div class="container mx-auto py-20">
	<div class="mx-auto max-w-md space-y-8">
		<header class="space-y-4 text-center">
			<div class="mb-4 flex items-center justify-center gap-2">
				<LogIn class="text-primary-500 size-8" />
				<h1 class="h1">Welcome <span class="text-primary-500">Back</span></h1>
			</div>
			<p class="text-lg opacity-75">
				Sign in to your account to access your dashboard and manage your projects.
			</p>
		</header>

		<AuthForm mode="login" />
	</div>
</div>
