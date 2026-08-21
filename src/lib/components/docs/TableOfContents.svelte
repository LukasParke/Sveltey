<script lang="ts">
	import { page } from '$app/state';
	import type { TocEntry } from '$lib/docs/engine';

	let { entries }: { entries: TocEntry[] } = $props();

	let activeId = $state('');

	// Highlight the heading currently in view; falls back to the last one
	// scrolled past so the rail always points somewhere meaningful.
	$effect(() => {
		if (entries.length === 0) return;
		const observer = new IntersectionObserver(
			(observerEntries) => {
				for (const entry of observerEntries) {
					if (entry.isIntersecting) {
						activeId = entry.target.id;
						return;
					}
				}
			},
			{ rootMargin: '-80px 0px -70% 0px' }
		);
		for (const entry of entries) {
			const el = document.getElementById(entry.id);
			if (el) observer.observe(el);
		}
		return () => observer.disconnect();
	});
</script>

{#if entries.length > 0}
	<nav class="space-y-3 text-sm" aria-label="On this page">
		<p class="font-semibold tracking-wider uppercase opacity-50">On this page</p>
		<ul class="border-surface-300-700 space-y-1 border-l">
			{#each entries as entry (entry.id)}
				<li>
					<a
						href="#{entry.id}"
						class="hover:border-primary-500 block border-l-2 border-transparent py-1 transition-colors {entry.level ===
						3
							? 'pl-7'
							: 'pl-4'} {page.url.hash === `#${entry.id}` || activeId === entry.id
							? 'border-primary-500 text-primary-500 font-medium'
							: 'opacity-75'}"
					>
						{entry.text}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
