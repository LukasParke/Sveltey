<script lang="ts">
	import { page } from '$app/state';
	import { AlertTriangle, Home, RefreshCw, ArrowLeft } from '@lucide/svelte';

	let status = $derived(page.status);
	let message = $derived(page.error?.message);

	const getErrorInfo = (status: number) => {
		switch (status) {
			case 404:
				return {
					title: 'Page Not Found',
					description: "The page you're looking for doesn't exist or has been moved.",
					icon: AlertTriangle,
					color: 'text-warning-500'
				};
			case 500:
				return {
					title: 'Server Error',
					description: 'Something went wrong on our end. Please try again later.',
					icon: AlertTriangle,
					color: 'text-error-500'
				};
			case 403:
				return {
					title: 'Access Forbidden',
					description: "You don't have permission to access this page.",
					icon: AlertTriangle,
					color: 'text-error-500'
				};
			default:
				return {
					title: 'Something went wrong',
					description: 'An unexpected error occurred. Please try again.',
					icon: AlertTriangle,
					color: 'text-error-500'
				};
		}
	};

	let errorInfo = $derived(getErrorInfo(status));
</script>

<svelte:head>
	<title>Error {status} - Something went wrong</title>
	<meta
		name="description"
		content="An error occurred while loading the page. Please try again or return to the homepage."
	/>
</svelte:head>

<div class="container mx-auto py-20">
	<div class="mx-auto max-w-2xl space-y-8 text-center">
		<!-- Error Icon and Status -->
		<div class="space-y-4">
			<errorInfo.icon class="mx-auto size-20 {errorInfo.color}" />
			<div class="space-y-2">
				<h1 class="h1">
					<span class="text-7xl font-bold {errorInfo.color}">{status}</span>
				</h1>
				<h2 class="h2">{errorInfo.title}</h2>
			</div>
		</div>

		<!-- Error Description -->
		<div class="card preset-outlined-surface-500 space-y-4 p-8">
			<p class="text-lg opacity-75">{errorInfo.description}</p>
			{#if message}
				<div class="card preset-outlined-error-500 p-4">
					<p class="text-error-600 dark:text-error-400 font-mono text-sm">{message}</p>
				</div>
			{/if}
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-col justify-center gap-4 sm:flex-row">
			<button
				onclick={() => window.history.back()}
				class="btn preset-outlined-surface-500 flex items-center gap-2"
				aria-label="Go back to previous page"
				title="Go back to previous page"
			>
				<ArrowLeft class="size-4" aria-hidden="true" />
				<span>Go Back</span>
			</button>

			<button
				onclick={() => window.location.reload()}
				class="btn preset-outlined-surface-500 flex items-center gap-2"
				aria-label="Reload current page"
				title="Reload current page"
			>
				<RefreshCw class="size-4" aria-hidden="true" />
				<span>Try Again</span>
			</button>

			<a
				href="/"
				class="btn preset-filled-primary-500 flex items-center gap-2"
				aria-label="Return to homepage"
				title="Return to homepage"
			>
				<Home class="size-4" aria-hidden="true" />
				<span>Go Home</span>
			</a>
		</div>

		<!-- Help Section -->
		<div class="space-y-2 text-sm">
			<p>Still having trouble? Here are some helpful links:</p>
			<div class="flex items-center justify-center gap-4">
				<a href="/blog" class="anchor">Blog</a>
				<span>•</span>
				<a href="/contact" class="anchor">Contact Support</a>
			</div>
		</div>
	</div>
</div>
