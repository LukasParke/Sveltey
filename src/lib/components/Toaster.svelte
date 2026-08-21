<script lang="ts">
	import { toaster } from '$lib/toaster.svelte';
	import { X } from '@lucide/svelte';

	const styles: Record<string, string> = {
		success: 'preset-filled-success-500',
		error: 'preset-filled-error-500',
		warning: 'preset-filled-warning-500',
		info: 'preset-filled-primary-500'
	};
</script>

<div
	class="fixed top-4 right-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-3"
	aria-live="polite"
	aria-label="Notifications"
>
	{#each toaster.toasts as toast (toast.id)}
		<div
			class="card {styles[toast.type]} flex items-start gap-3 p-4 shadow-xl"
			role="status"
			data-toast-type={toast.type}
		>
			<div class="flex-1 space-y-1">
				<p class="font-semibold">{toast.title}</p>
				{#if toast.description}
					<p class="text-sm opacity-90">{toast.description}</p>
				{/if}
			</div>
			<button
				type="button"
				class="opacity-75 transition-opacity hover:opacity-100"
				onclick={() => toaster.dismiss(toast.id)}
				aria-label="Dismiss notification"
			>
				<X class="size-4" />
			</button>
		</div>
	{/each}
</div>
