<script lang="ts">
	import { page } from '$app/state';
	import { getPlanById } from '$lib/config/plans';
	import { userDisplayName } from '$lib/auth/helpers';
	import {
		BarChart,
		CreditCard,
		Key,
		LifeBuoy,
		Settings,
		ShieldCheck,
		Star,
		User,
		Zap
	} from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const user = $derived(page.data.user);
	const session = $derived(page.data.session);

	const subscription = $derived(data.subscription);
	const activeStatuses = ['active', 'trialing', 'past_due'];
	const hasActiveSubscription = $derived(
		subscription?.status != null && activeStatuses.includes(subscription.status)
	);
	const currentPlanName = $derived(
		hasActiveSubscription ? (getPlanById(subscription?.plan_id)?.name ?? 'Paid Plan') : 'Starter'
	);

	const memberSince = $derived(
		user?.created_at
			? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
			: null
	);
	const signInProvider = $derived(
		(user?.identities?.[0]?.provider ?? user?.app_metadata?.provider ?? 'email') as string
	);

	const overviewStats = $derived([
		{ label: 'Current Plan', value: currentPlanName, icon: Star, color: 'text-primary-500' },
		{
			label: 'Sign-in Method',
			value: signInProvider.charAt(0).toUpperCase() + signInProvider.slice(1),
			icon: ShieldCheck,
			color: 'text-success-500'
		},
		{ label: 'Member Since', value: memberSince ?? '—', icon: User, color: 'text-warning-500' },
		{
			label: 'Account Status',
			value: subscription?.status ? subscription.status.replace('_', ' ') : 'Active',
			icon: Zap,
			color: 'text-secondary-500'
		}
	]);

	const quickActions = [
		{
			title: 'Profile',
			description: 'View and manage your personal information and account details.',
			icon: User,
			action: 'Go to Profile',
			href: '/app/dashboard/profile'
		},
		{
			title: 'Billing',
			description: 'Review your plan, invoices, and payment methods via Stripe.',
			icon: CreditCard,
			action: 'Manage Billing',
			href: '/app/dashboard/billing'
		},
		{
			title: 'Support',
			description: 'Questions or issues? Get in touch with our team.',
			icon: LifeBuoy,
			action: 'Contact Support',
			href: '/contact'
		}
	];

	const comingSoonActions = [
		{
			title: 'API Keys',
			description: 'Manage API keys for programmatic access to our services.',
			icon: Key,
			action: 'Manage Keys'
		},
		{
			title: 'Usage Analytics',
			description: 'Detailed usage statistics and analytics for your account.',
			icon: BarChart,
			action: 'View Analytics'
		}
	];
</script>

<svelte:head>
	<title>Dashboard - Welcome Back</title>
	<meta
		name="description"
		content="Manage your account, view your plan, and access all your SaaS features from your personalized dashboard."
	/>
</svelte:head>

<div class="container mx-auto space-y-20 py-20">
	{#if session}
		<!-- Welcome Header -->
		<header class="mx-auto max-w-3xl space-y-4 text-center">
			<h1 class="h1">
				Welcome back,
				<span class="text-primary-500">{userDisplayName(user)}</span>!
			</h1>
			<p class="text-xl opacity-75">
				Manage your account and access your SaaS features from your personalized dashboard.
			</p>
		</header>

		<div class="flex justify-center">
			<hr class="hr border-surface-500 max-w-64" />
		</div>

		<!-- Account Overview -->
		<section class="space-y-8">
			<h2 class="h2 text-center">Account Overview</h2>
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{#each overviewStats as stat (stat.label)}
					<div
						class="card preset-outlined-surface-500 space-y-4 p-6 text-center transition-all duration-300 hover:scale-105"
						role="article"
						aria-label="{stat.label}: {stat.value}"
					>
						<stat.icon class={`mx-auto size-8 ${stat.color}`} aria-hidden="true" />
						<div class="space-y-1">
							<div class="text-2xl font-bold capitalize">{stat.value}</div>
							<p class="text-sm opacity-75">{stat.label}</p>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<div class="flex justify-center">
			<hr class="hr border-surface-500 max-w-64" />
		</div>

		<!-- Quick Actions -->
		<section class="space-y-8">
			<h2 class="h2 text-center">Quick Actions</h2>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
				{#each quickActions as action (action.title)}
					<div
						class="card preset-outlined-surface-500 group space-y-4 p-6 transition-all duration-300 hover:scale-105 md:p-8"
					>
						<action.icon
							class="text-primary-500 size-10 transition-transform group-hover:scale-110"
							aria-hidden="true"
						/>
						<h3 class="group-hover:text-primary-500 h4 transition-colors">{action.title}</h3>
						<p class="text-sm opacity-75">{action.description}</p>
						<a
							href={action.href}
							class="btn preset-filled-primary-500 w-full"
							aria-label="{action.action} - {action.title}"
						>
							{action.action}
						</a>
					</div>
				{/each}
			</div>
			<div class="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
				{#each comingSoonActions as action (action.title)}
					<div class="card preset-outlined-surface-500 space-y-4 p-6 opacity-75">
						<action.icon class="text-surface-500 size-10" aria-hidden="true" />
						<h3 class="h4">{action.title}</h3>
						<p class="text-sm opacity-75">{action.description}</p>
						<button
							class="btn preset-outlined-surface-500 w-full opacity-50"
							disabled
							aria-label="{action.action} (Coming Soon)"
							title="This feature is coming soon"
						>
							{action.action} (Coming Soon)
						</button>
					</div>
				{/each}
			</div>
		</section>

		<div class="flex justify-center">
			<hr class="hr border-surface-500 max-w-64" />
		</div>

		<!-- Current Plan & Upgrade -->
		<section class="space-y-8">
			<div class="card preset-outlined-primary-500 space-y-6 p-8 text-center">
				<div class="flex items-center justify-center gap-2">
					<Star class="text-primary-500 size-8" aria-hidden="true" />
					<h3 class="text-primary-500 h3">Current Plan: {currentPlanName}</h3>
				</div>
				<p class="mx-auto max-w-2xl opacity-75">
					{#if hasActiveSubscription}
						Your subscription is managed through Stripe. You can change plans, update payment
						methods, or cancel anytime from the billing portal.
					{:else}
						You're on the free Starter plan. Upgrade to unlock advanced features, higher limits, and
						priority support.
					{/if}
				</p>
				<div class="flex flex-col justify-center gap-4 sm:flex-row">
					<a
						href="/pricing"
						class="btn preset-filled-primary-500"
						aria-label="View plans and upgrade"
					>
						<Star class="size-5" aria-hidden="true" />
						<span>{hasActiveSubscription ? 'Change Plan' : 'Upgrade Plan'}</span>
					</a>
					<a
						href="/app/dashboard/billing"
						class="btn preset-outlined-surface-500"
						aria-label="Open billing dashboard"
					>
						<CreditCard class="size-5" aria-hidden="true" />
						<span>Billing Details</span>
					</a>
				</div>
			</div>
		</section>
	{:else if session === null}
		<!-- Access Denied -->
		<div class="card preset-outlined-error-500 mx-auto max-w-2xl space-y-6 p-8 text-center md:p-12">
			<ShieldCheck class="text-error-500 mx-auto size-16" aria-hidden="true" />
			<h2 class="h3">Access Denied</h2>
			<p class="opacity-75">
				You need to be logged in to access your dashboard. Please sign in to continue.
			</p>
			<div class="flex flex-col justify-center gap-4 sm:flex-row">
				<a
					href="/auth/login?next=%2Fapp%2Fdashboard"
					class="btn preset-filled-primary-500"
					aria-label="Sign in to access your dashboard"
				>
					<User class="size-5" aria-hidden="true" />
					<span>Sign In</span>
				</a>
				<a
					href="/auth/register?next=%2Fapp%2Fdashboard"
					class="btn preset-outlined-surface-500"
					aria-label="Create new account to get started"
				>
					<Settings class="size-5" aria-hidden="true" />
					<span>Create Account</span>
				</a>
			</div>
		</div>
	{:else}
		<!-- Loading State -->
		<div
			class="card preset-outlined-surface-500 mx-auto max-w-2xl space-y-4 p-8 text-center md:p-12"
			role="status"
			aria-live="polite"
		>
			<div
				class="border-primary-500 mx-auto h-12 w-12 animate-spin rounded-full border-b-2"
				aria-label="Loading dashboard"
			></div>
			<h3 class="h4">Loading your dashboard...</h3>
		</div>
	{/if}
</div>
