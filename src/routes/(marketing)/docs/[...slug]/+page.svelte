<script lang="ts">
	import type { Component } from 'svelte';
	import { page } from '$app/state';
	import DocsSidebar from '$lib/components/docs/DocsSidebar.svelte';
	import TableOfContents from '$lib/components/docs/TableOfContents.svelte';
	import { getDocComponent } from '$lib/docs/engine';
	import { ArrowLeft, ArrowRight, ListTree, X } from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let Content = $derived(
		typeof page.params.slug === 'string'
			? (getDocComponent(page.params.slug) as Component | null)
			: null
	);
	let mobileNavOpen = $state(false);
	// Close the mobile drawer on navigation.
	$effect(() => {
		void page.url.pathname; // track navigation
		mobileNavOpen = false;
	});
</script>

<svelte:head>
	<title>{data.doc.meta.title} - Sveltey Docs</title>
</svelte:head>

<div class="container mx-auto px-4 py-10">
	<div
		class="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_220px] xl:gap-10"
	>
		<!-- Sidebar (desktop) -->
		<aside class="hidden lg:block">
			<div class="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
				<DocsSidebar />
			</div>
		</aside>

		<!-- Main column -->
		<main class="max-w-3xl min-w-0 space-y-8">
			<!-- Breadcrumb -->
			<nav class="flex items-center gap-2 text-sm opacity-75" aria-label="Breadcrumb">
				<a href="/docs" class="hover:text-primary-500 transition-colors">Docs</a>
				{#if data.section}
					<span aria-hidden="true">/</span>
					<a
						href="/docs/{data.section.id === data.doc.meta.sectionId
							? data.doc.meta.slug
							: data.section.id}"
						class="hover:text-primary-500 transition-colors"
					>
						{data.section.title}
					</a>
				{/if}
				<span aria-hidden="true">/</span>
				<span class="text-primary-500 font-medium">{data.doc.meta.title}</span>
			</nav>

			<header class="space-y-2">
				<h1 class="h1">{data.doc.meta.title}</h1>
				{#if data.doc.description}
					<p class="text-lg opacity-75">{data.doc.description}</p>
				{/if}
			</header>

			<article
				class="prose prose-surface dark:prose-invert prose-headings:scroll-mt-24 prose-a:text-primary-500 prose-pre:bg-[#282c34] prose-pre:rounded-xl max-w-none"
			>
				{#if Content}
					<Content />
				{:else}
					<p class="opacity-50">This page has no content yet.</p>
				{/if}
			</article>

			<!-- Previous / Next -->
			<div
				class="not-prose border-surface-300-700 grid grid-cols-1 gap-4 border-t pt-8 sm:grid-cols-2"
			>
				{#if data.prev}
					<a
						href="/docs/{data.prev.slug}"
						class="card preset-outlined-surface-500 group hover:border-primary-500 space-y-1 p-4 transition-colors"
					>
						<span class="flex items-center gap-1 text-xs opacity-60">
							<ArrowLeft class="size-3" /> Previous
						</span>
						<span class="group-hover:text-primary-500 font-medium transition-colors">
							{data.prev.title}
						</span>
					</a>
				{:else}
					<span></span>
				{/if}
				{#if data.next}
					<a
						href="/docs/{data.next.slug}"
						class="card preset-outlined-surface-500 group hover:border-primary-500 space-y-1 p-4 text-right transition-colors"
					>
						<span class="flex items-center justify-end gap-1 text-xs opacity-60">
							Next <ArrowRight class="size-3" />
						</span>
						<span class="group-hover:text-primary-500 font-medium transition-colors">
							{data.next.title}
						</span>
					</a>
				{/if}
			</div>
		</main>

		<!-- TOC rail (wide screens) -->
		<aside class="hidden xl:block">
			<div class="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
				<TableOfContents entries={data.doc.headings} />
			</div>
		</aside>
	</div>
</div>

<!-- Mobile nav toggle -->
<button
	type="button"
	class="btn btn-sm fixed right-4 bottom-4 z-40 shadow-lg lg:hidden"
	onclick={() => (mobileNavOpen = !mobileNavOpen)}
	aria-label={mobileNavOpen ? 'Close docs navigation' : 'Open docs navigation'}
	aria-expanded={mobileNavOpen}
>
	{#if mobileNavOpen}
		<X class="size-4" />
	{:else}
		<ListTree class="size-4" />
		<span>Menu</span>
	{/if}
</button>

{#if mobileNavOpen}
	<div
		class="fixed inset-0 z-30 bg-black/50"
		role="presentation"
		onclick={() => (mobileNavOpen = false)}
	></div>
	<div
		class="bg-surface-50-950 border-surface-300-700 fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto border-r p-6"
	>
		<div class="mb-4 flex items-center justify-between">
			<span class="font-semibold">Documentation</span>
			<button
				type="button"
				class="btn btn-sm"
				onclick={() => (mobileNavOpen = false)}
				aria-label="Close navigation"
			>
				<X class="size-4" />
			</button>
		</div>
		<DocsSidebar onNavigate={() => (mobileNavOpen = false)} />
	</div>
{/if}
