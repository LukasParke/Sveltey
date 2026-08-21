<script lang="ts">
	import { page } from '$app/state';
	import { docSections } from '$lib/config/docs';

	let { onNavigate }: { onNavigate?: () => void } = $props();
</script>

<nav class="space-y-6 text-sm" aria-label="Documentation">
	{#each docSections as section (section.id)}
		<div>
			<p class="mb-2 font-semibold tracking-wider uppercase opacity-50">{section.title}</p>
			<ul class="space-y-1">
				{#each section.items as item (item.slug)}
					{@const active = page.url.pathname === `/docs/${item.slug}`}
					<li>
						<a
							href={`/docs/${item.slug}`}
							class="block rounded-md px-3 py-1.5 transition-colors {active
								? 'bg-primary-500/10 text-primary-500 font-medium'
								: 'hover:bg-surface-100-900 opacity-75 hover:opacity-100'}"
							onclick={onNavigate}
							aria-current={active ? 'page' : undefined}
						>
							{item.title}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</nav>
