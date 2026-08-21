<script lang="ts">
	let { count = 0 }: { count: number } = $props();
</script>

<span class="outer">
	<button onclick={() => (count = count - 1)}>-</button>
	<span class="inner">{count}</span>
	<button onclick={() => (count = count + 1)}>+</button>
</span>

<style>
	.outer {
		background: darkorange;
		height: 20px;
		font-size: 12px;
		display: inline-flex;
		justify-content: space-between;
		align-items: center;
		transform: translateY(-1px);
		margin: 0 5px;
		border-radius: 3px;
		width: 65px;
		box-shadow: 0 3px 15px 1px rgba(0, 0, 0, 0.3);
	}

	.inner {
		margin: 0 0px;
	}

	button {
		height: 20px;
		padding: 0px 7px 1px 7px;
		margin: 0;
		border: none;
		background: none;
		color: #eee;
		font-weight: bold;
		cursor: pointer;
	}
</style>
