<script lang="ts">
	const year = new Date().getFullYear();
</script>

<footer class="bg-surface-100-850-token border-surface-500 mt-20 border-t">
	<div class="container mx-auto px-4 py-12 md:px-6">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-4">
			<!-- Brand Column -->
			<div class="space-y-4">
				<div class="flex items-center gap-2">
					<div class="bg-primary-500 flex h-8 w-8 items-center justify-center rounded-lg">
						<span class="text-lg font-bold text-white">S</span>
					</div>
					<span class="text-xl font-bold">Sveltey</span>
				</div>
				<p class="text-sm opacity-75">
					The complete SvelteKit & Supabase SaaS template. Launch your next project in minutes, not
					months.
				</p>
			</div>

			<!-- Product Links -->
			<div class="space-y-4">
				<h3 class="font-semibold">Product</h3>
				<div class="space-y-2 text-sm">
					<a href="/pricing" class="block opacity-75 transition-opacity hover:opacity-100"
						>Pricing</a
					>
					<a href="/blog" class="block opacity-75 transition-opacity hover:opacity-100">Blog</a>
					<a href="/app/dashboard" class="block opacity-75 transition-opacity hover:opacity-100"
						>Dashboard</a
					>
				</div>
			</div>

			<!-- Support Links -->
			<div class="space-y-4">
				<h3 class="font-semibold">Support</h3>
				<div class="space-y-2 text-sm">
					<a
						href="https://github.com/LukeHagar/sveltey"
						class="block opacity-75 transition-opacity hover:opacity-100"
					>
						GitHub
					</a>
					<a href="/contact" class="block opacity-75 transition-opacity hover:opacity-100">
						Contact & Help Center
					</a>
				</div>
			</div>

			<!-- Legal Links -->
			<div class="space-y-4">
				<h3 class="font-semibold">Legal</h3>
				<div class="space-y-2 text-sm">
					<a href="/privacy" class="block opacity-75 transition-opacity hover:opacity-100">
						Privacy Policy
					</a>
					<a href="/terms" class="block opacity-75 transition-opacity hover:opacity-100">
						Terms of Service
					</a>
				</div>
			</div>
		</div>

		<!-- Footer Bottom -->
		<div
			class="border-surface-300-600-token mt-8 flex flex-col items-center justify-between border-t pt-8 md:flex-row"
		>
			<p class="text-sm opacity-50">© {year} Sveltey. All rights reserved.</p>
			<div class="mt-4 flex flex-wrap items-center justify-center gap-4 md:mt-0">
				<span class="text-sm opacity-50">Built with</span>
				<div class="flex items-center gap-2 text-sm opacity-75">
					<a class="anchor" href="https://kit.svelte.dev/" target="_blank" rel="noopener noreferrer"
						>SvelteKit</a
					>
					<span>•</span>
					<a class="anchor" href="https://supabase.com/" target="_blank" rel="noopener noreferrer"
						>Supabase</a
					>
					<span>•</span>
					<a class="anchor" href="https://skeleton.dev/" target="_blank" rel="noopener noreferrer"
						>Skeleton UI</a
					>
				</div>
			</div>
		</div>
	</div>
</footer>
