<script lang="ts">
	import AuthForm from '$lib/components/auth/AuthForm.svelte';
	import { Star } from '@lucide/svelte';
</script>

<svelte:head>
	<title>Sign Up - Sveltey</title>
	<meta
		name="description"
		content="Create your account to start building with our comprehensive SaaS template."
	/>
</svelte:head>

<div class="container mx-auto py-20">
	<div class="mx-auto max-w-md space-y-8">
		<header class="space-y-4 text-center">
			<div class="mb-4 flex items-center justify-center gap-2">
				<Star class="text-primary-500 size-8" />
				<h1 class="h1">Get <span class="text-primary-500">Started</span></h1>
			</div>
			<p class="text-lg opacity-75">
				Create your account to start building with our comprehensive SaaS template.
			</p>
		</header>

		<AuthForm mode="register" />
	</div>
</div>
