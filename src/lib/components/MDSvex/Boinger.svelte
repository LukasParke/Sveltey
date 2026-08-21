<script lang="ts">
	import { flip } from 'svelte/animate';
	import { crossfade, scale } from 'svelte/transition';

	export let color = 'pink';

	// @ts-expect-error - scale is a valid fallback
	const [send, receive] = crossfade({ fallback: scale });

	let boingers = [
		{ val: 1, boinged: true },
		{ val: 2, boinged: true },
		{ val: 3, boinged: false },
		{ val: 4, boinged: true },
		{ val: 5, boinged: false }
	];

	function toggleBoing(id: number) {
		const index = boingers.findIndex((v) => v.val === id);
		boingers[index].boinged = !boingers[index].boinged;
	}
</script>

<div class="container">
	<div class="boingers">
		{#each boingers.filter((v) => !v.boinged) as { val } (val)}
			<button
				animate:flip
				in:receive={{ key: val }}
				out:send={{ key: val }}
				style="background:{color};"
				onclick={() => toggleBoing(val)}
				>{val}
			</button>
		{/each}
	</div>

	<div class="boingers">
		{#each boingers.filter((v) => v.boinged) as { val } (val)}
			<button
				animate:flip
				in:receive={{ key: val }}
				out:send={{ key: val }}
				style="background:{color};"
				onclick={() => toggleBoing(val)}
			>
				{val}
			</button>
		{/each}
	</div>
</div>

<style>
	.container {
		width: 300px;
		height: 200px;
		display: flex;
		justify-content: space-between;
	}

	.boingers {
		display: grid;
		grid-template-rows: repeat(3, 1fr);
		grid-template-columns: repeat(2, 1fr);
		grid-gap: 10px;
	}

	.boingers button {
		width: 50px;
		height: 50px;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #eee;
		font-weight: bold;
		border-radius: 2px;
		cursor: pointer;
	}
</style>
