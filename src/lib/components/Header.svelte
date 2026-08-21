<script lang="ts">
	import { page } from '$app/state';
	import SvelteyLogoLetter from '$lib/assets/Sveltey-logo-letter.svelte';
	import ThemeSwitch from '$lib/components/ThemeSwitch.svelte';
	import {
		BookOpen,
		DollarSign,
		FormInputIcon,
		Home,
		LayoutDashboard,
		LogOut,
		User
	} from '@lucide/svelte';

	let { data } = $props();

	let { session } = $derived(data);

	const avatarUrl = $derived(session?.user?.user_metadata?.avatar_url as string | undefined);
	const avatarName = $derived(
		String(session?.user?.user_metadata?.full_name || session?.user?.email || 'User')
	);

	// Helper function to get navigation link classes
	function getNavClasses(path: string): string {
		return `btn btn-sm flex items-center gap-2 ${page.url.pathname === path ? 'cursor-default disabled' : ''}`;
	}
</script>

<header
	class="bg-surface-50-950-token border-surface-200-700-token sticky top-0 z-50 border-b backdrop-blur-2xl"
>
	<nav class="container mx-auto px-2 py-2 md:px-6 md:py-4">
		<div class="flex items-center justify-between">
			<!-- Left side - Brand and Main navigation -->
			<div class="flex items-center gap-8">
				<!-- Brand -->
				<a href="/" class="flex items-center gap-2" aria-label="Sveltey - Go to homepage">
					<SvelteyLogoLetter size="size-8" />
					<span class="hidden font-bold sm:block">Sveltey</span>
				</a>

				<!-- Main Navigation -->
				<div class="hidden items-center gap-2 md:flex">
					<a href="/" class={getNavClasses('/')} aria-label="Go to homepage">
						<Home class="size-4" aria-hidden="true" />
						<span>Home</span>
					</a>

					<a href="/pricing" class={getNavClasses('/pricing')} aria-label="View pricing plans">
						<DollarSign class="size-4" aria-hidden="true" />
						<span>Pricing</span>
					</a>

					<a href="/blog" class={getNavClasses('/blog')} aria-label="Read our blog">
						<BookOpen class="size-4" aria-hidden="true" />
						<span>Blog</span>
					</a>

					{#if session}
						<a
							href="/app/dashboard"
							class={getNavClasses('/app/dashboard')}
							aria-label="Go to dashboard"
						>
							<LayoutDashboard class="size-4" aria-hidden="true" />
							<span>Dashboard</span>
						</a>
					{/if}
				</div>
			</div>

			<!-- Right side - User actions and theme switcher -->
			<div class="flex gap-1 md:gap-3">
				<ThemeSwitch />

				{#if session}
					<!-- User Profile Section -->
					<div class="border-surface-300-600 flex items-center gap-3 border-l pl-3">
						<span class="flex size-8 items-center justify-center overflow-hidden rounded-full">
							{#if avatarUrl}
								<img class="size-8 rounded-full object-cover" src={avatarUrl} alt={avatarName} />
							{:else}
								<span
									class="bg-primary-500 text-on-primary-500 flex size-8 items-center justify-center rounded-full font-semibold"
									aria-hidden="true"
								>
									{avatarName.charAt(0).toUpperCase()}
								</span>
							{/if}
						</span>
						<div class="hidden md:block">
							<p class="text-sm font-medium">
								{session.user.user_metadata.full_name || session.user.email?.split('@')[0]}
							</p>
							<p class="text-xs opacity-75">{session.user.email}</p>
						</div>
						<form action="/auth/logout" method="POST" style="display: inline;">
							<button
								type="submit"
								class="btn flex items-center gap-2"
								title="Sign Out"
								aria-label="Sign out of your account"
							>
								<LogOut class="size-4" aria-hidden="true" />
								<span class="hidden sm:inline">Sign Out</span>
							</button>
						</form>
					</div>
				{:else}
					<!-- Authentication Buttons -->
					<div class="hidden items-center gap-1 md:flex md:gap-3">
						<a href="/auth/login" class={getNavClasses('/auth/login')} aria-label="Login">
							<User class="size-4" aria-hidden="true" />
							<span class="">Login</span>
						</a>
						<a href="/auth/register" class={getNavClasses('/auth/register')} aria-label="Register">
							<FormInputIcon class="size-4" aria-hidden="true" />
							<span class="">Register</span>
						</a>
					</div>
				{/if}
			</div>
		</div>
		<div class="block pt-2 md:hidden">
			<nav class="flex flex-wrap items-center justify-center gap-1">
				<a href="/" class={getNavClasses('/')} aria-label="Go to homepage">
					<Home class="size-4" aria-hidden="true" />
					Home
				</a>
				<a href="/pricing" class={getNavClasses('/pricing')} aria-label="View pricing plans">
					<DollarSign class="size-4" aria-hidden="true" />
					Pricing
				</a>
				<a href="/blog" class={getNavClasses('/blog')} aria-label="Read our blog">
					<BookOpen class="size-4" aria-hidden="true" />
					Blog
				</a>
				<div class="flex justify-center gap-2">
					{#if session}
						<a
							href="/app/dashboard"
							class={getNavClasses('/app/dashboard')}
							aria-label="Go to dashboard"
						>
							<LayoutDashboard class="size-4" aria-hidden="true" />
							Dashboard
						</a>
					{:else}
						<a href="/auth/login" class={getNavClasses('/auth/login')} aria-label="Login">
							<User class="size-4" aria-hidden="true" />
							<span class="">Login</span>
						</a>
						<a href="/auth/register" class={getNavClasses('/auth/register')} aria-label="Register">
							<FormInputIcon class="size-4" aria-hidden="true" />
							<span class="">Register</span>
						</a>
					{/if}
				</div>
			</nav>
		</div>
	</nav>
</header>
