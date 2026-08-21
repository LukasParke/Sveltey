<script lang="ts">
	// Icons
	import { Rocket, Database, Zap, Star, Users, GitBranch } from '@lucide/svelte';

	import Skeleton from '$lib/assets/skeleton.svelte';

	let { data } = $props();
</script>

<div class="container mx-auto space-y-20 p-4 py-20">
	<!-- Hero Section -->
	<header class="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto]">
		<div class="order-2 max-w-3xl space-y-8 lg:order-1">
			<h1 class="h1">Launch Your SaaS in <span class="text-primary-500">Minutes</span></h1>
			<p class="text-2xl opacity-75">
				The complete SvelteKit & Supabase template with authentication, payments, and beautiful UI
				components. Skip the boilerplate and focus on what matters most.
			</p>
			<div class="flex flex-col gap-4 sm:flex-row">
				{#if data.session}
					<a
						href="/app/dashboard"
						class="btn btn-lg preset-filled-primary-500"
						aria-label="Go to your dashboard"
					>
						<Rocket class="size-5" aria-hidden="true" />
						<span>Go to Dashboard</span>
					</a>
				{:else}
					<a
						href="/auth/register"
						class="btn btn-lg preset-filled-primary-500"
						aria-label="Sign up for free account"
					>
						<Star class="size-5" aria-hidden="true" />
						<span>Get Started Free</span>
					</a>
					<a
						href="/auth/login"
						class="btn btn-lg preset-outlined-primary-500"
						aria-label="Sign in to existing account"
					>
						<span>Sign In</span>
					</a>
				{/if}
			</div>
		</div>
		<!-- Hero Image/Graphic -->
		<div class="order-1 flex justify-center lg:order-2">
			<div
				class="from-primary-500/20 to-secondary-500/20 animate-tilt flex size-64 items-center justify-center rounded-full bg-gradient-to-br shadow-2xl lg:size-96"
				role="img"
				aria-label="SaaS launch illustration"
			>
				<Rocket class="text-primary-500 size-32 lg:size-64" aria-hidden="true" />
			</div>
		</div>
	</header>

	<div class="flex justify-center">
		<hr class="hr border-surface-500 max-w-64" />
	</div>

	<!-- Stats Section -->
	<section>
		<div class="flex flex-wrap justify-center gap-20 text-center font-bold">
			<div class="space-y-1">
				<span class="text-7xl">99%</span>
				<p class="text-primary-500">Faster Development</p>
			</div>
			<div class="space-y-1">
				<span class="text-7xl">50+</span>
				<p class="text-primary-500">Components Ready</p>
			</div>
			<div class="space-y-1">
				<span class="text-7xl">100%</span>
				<p class="text-primary-500">Type Safe</p>
			</div>
			<div class="space-y-1">
				<span class="text-7xl">∞</span>
				<p class="text-primary-500">Possibilities</p>
			</div>
		</div>
	</section>

	<div class="flex justify-center">
		<hr class="hr border-surface-500 max-w-64" />
	</div>

	<!-- Features Section -->
	<section class="flex flex-wrap gap-4">
		<div class="card preset-outlined-surface-500 min-w-[250px] flex-1 space-y-4 p-4 md:p-8">
			<Database class="stroke-primary-500 size-10" aria-hidden="true" />
			<h3 class="h3">Supabase Ready</h3>
			<p class="opacity-75">
				Authentication, real-time database, and file storage configured out of the box. Just add
				your Supabase credentials and you're ready to go.
			</p>
		</div>
		<div class="card preset-outlined-surface-500 min-w-[250px] flex-1 space-y-4 p-4 md:p-8">
			<Zap class="stroke-primary-500 size-10" aria-hidden="true" />
			<h3 class="h3">Lightning Fast</h3>
			<p class="opacity-75">
				Built with SvelteKit for maximum performance. Server-side rendering, optimistic updates, and
				blazing fast navigation included.
			</p>
		</div>
		<div class="card preset-outlined-surface-500 min-w-[250px] flex-1 space-y-4 p-4 md:p-8">
			<GitBranch class="stroke-primary-500 size-10" aria-hidden="true" />
			<h3 class="h3">Developer Experience</h3>
			<p class="opacity-75">
				TypeScript, ESLint, Prettier, and comprehensive documentation. Built by developers, for
				developers with love and attention to detail.
			</p>
		</div>
	</section>

	<div class="flex justify-center">
		<hr class="hr border-surface-500 max-w-64" />
	</div>

	<!-- Technologies Section -->
	<section class="space-y-8 text-center">
		<h2 class="h2">Built With <span class="text-primary-500">Modern Tools</span></h2>
		<div class="grid grid-cols-2 items-center gap-8 md:grid-cols-4">
			<div class="space-y-2">
				<div class="mx-auto flex items-center justify-center">
					<img src="/logos/svelte-logo-square.svg" alt="SvelteKit" class="size-16" />
				</div>
				<p class="text-lg font-bold">SvelteKit</p>
			</div>
			<div class="space-y-2">
				<div class="mx-auto flex items-center justify-center">
					<Skeleton alt="Skeleton UI" class="size-16 fill-black dark:fill-white" />
				</div>
				<p class="text-lg font-bold">Skeleton UI</p>
			</div>
			<div class="space-y-2">
				<div class="mx-auto flex items-center justify-center">
					<img src="/logos/tailwind-logo-square.svg" alt="Tailwind CSS" class="size-16" />
				</div>
				<p class="text-lg font-bold">Tailwind CSS</p>
			</div>
			<div class="space-y-2">
				<div class="mx-auto flex items-center justify-center">
					<img src="/logos/supabase-logo-icon.svg" alt="Supabase" class="size-16" />
				</div>
				<p class="text-lg font-bold">Supabase</p>
			</div>
			<div class="space-y-2">
				<div class="rounded-base mx-auto flex size-16 items-center justify-center bg-black p-2">
					<img src="/logos/resend-icon-white.svg" alt="Resend" class="size-16" />
				</div>
				<p class="text-lg font-bold">Resend</p>
			</div>
			<div class="space-y-2">
				<div class="mx-auto flex items-center justify-center">
					<img src="/logos/ts-logo-512.svg" alt="TypeScript" class="size-16" />
				</div>
				<p class="text-lg font-bold">TypeScript</p>
			</div>
		</div>
	</section>

	<div class="flex justify-center">
		<hr class="hr border-surface-500 max-w-64" />
	</div>

	<!-- Call to Action Section -->
	<section class="grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto]">
		<div class="space-y-2 text-center md:text-left">
			<h3 class="h3">Ready to build your next big idea?</h3>
			<p class="opacity-75">
				Join thousands of developers who trust our template to kickstart their SaaS projects.
			</p>
		</div>
		{#if !data.session}
			<a
				href="/auth/register"
				class="btn md:btn-lg preset-filled-primary-500"
				aria-label="Start building your SaaS today"
			>
				<Users class="size-5" aria-hidden="true" />
				<span>Start Building Today</span>
			</a>
		{:else}
			<a
				href="/pricing"
				class="btn md:btn-lg preset-filled-secondary-500"
				aria-label="View pricing plans"
			>
				<Star class="size-5" aria-hidden="true" />
				<span>View Pricing</span>
			</a>
		{/if}
	</section>
</div>
