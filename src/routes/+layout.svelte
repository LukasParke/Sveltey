<script lang="ts">
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { MetaTags, deepMerge } from 'svelte-meta-tags';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import Toaster from '$lib/components/Toaster.svelte';

	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';

	import 'prism-themes/themes/prism-vsc-dark-plus.css';
	import '../app.css';

	try {
		injectSpeedInsights();
	} catch (error) {
		console.error(error);
	}

	let { data, children } = $props();
	let { session, supabase } = $derived(data);

	// Merge base meta tags with page-specific meta tags
	let metaTags = $derived(deepMerge(data.baseMetaTags, page.data.pageMetaTags || {}));

	onMount(() => {
		// Sync client-side session with server-side on mount
		const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

<!-- Meta Tags -->
<MetaTags {...metaTags} />

<!-- Toasts -->
<Toaster />

<!-- Header -->
<Header {data} />

<!-- Main Content -->
<main class="min-h-screen px-4">
	{@render children()}
</main>

<!-- Footer -->
<Footer />
