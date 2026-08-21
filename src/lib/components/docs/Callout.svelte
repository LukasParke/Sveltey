<script lang="ts">
	import type { Snippet } from 'svelte';
	import { CircleAlert, CircleCheck, Info, TriangleAlert } from '@lucide/svelte';

	type Kind = 'info' | 'success' | 'warning' | 'danger';

	interface Props {
		kind?: Kind;
		title?: string;
		children: Snippet;
	}

	let { kind = 'info', title = '', children }: Props = $props();

	const styles: Record<Kind, string> = {
		info: 'preset-outlined-primary-500',
		success: 'preset-outlined-success-500',
		warning: 'preset-outlined-warning-500',
		danger: 'preset-outlined-error-500'
	};
	const icons: Record<Kind, typeof Info> = {
		info: Info,
		success: CircleCheck,
		warning: TriangleAlert,
		danger: CircleAlert
	};
	const titles: Record<Kind, string> = {
		info: 'Note',
		success: 'Success',
		warning: 'Warning',
		danger: 'Danger'
	};

	const Icon = $derived(icons[kind]);
</script>

<div class="card {styles[kind]} flex items-start gap-3 p-4">
	<Icon class="mt-0.5 size-5 flex-shrink-0" aria-hidden="true" />
	<div class="space-y-1 text-sm">
		<p class="font-semibold">{title || titles[kind]}</p>
		<div class="opacity-90">{@render children()}</div>
	</div>
</div>
