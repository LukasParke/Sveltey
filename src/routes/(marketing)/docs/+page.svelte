<script lang="ts">
	import { BookOpen } from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Documentation - Sveltey</title>
	<meta
		name="description"
		content="Complete documentation for the Sveltey SaaS template: authentication, Stripe payments, theming, blog, and deployment."
	/>
</svelte:head>

<div class="container mx-auto py-16">
	<header class="mx-auto max-w-3xl space-y-4 text-center">
		<div class="mb-4 flex items-center justify-center gap-2">
			<BookOpen class="text-primary-500 size-8" />
			<h1 class="h1">Sveltey <span class="text-primary-500">Docs</span></h1>
		</div>
		<p class="text-xl opacity-75">
			Everything you need to build, customize, and ship a SaaS on this template — written in
			MDX-style markdown with live Svelte components.
		</p>
	</header>

	<div class="mt-16 space-y-12">
		{#each data.sections as section (section.id)}
			<section aria-labelledby={`docs-section-${section.id}`}>
				<h2 id={`docs-section-${section.id}`} class="h3">{section.title}</h2>
				<p class="mt-1 mb-6 opacity-75">{section.description}</p>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each section.items as item (item.slug)}
						<a
							href="/docs/{item.slug}"
							class="card preset-outlined-surface-500 hover:border-primary-500 space-y-1 p-5 transition-colors hover:shadow-lg"
						>
							<span class="text-primary-500 font-medium">{item.title}</span>
							<span class="block text-sm opacity-60">/docs/{item.slug}</span>
						</a>
					{/each}
				</div>
			</section>
		{/each}
	</div>
</div>
