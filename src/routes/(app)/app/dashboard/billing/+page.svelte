<script lang="ts">
	import { afterNavigate, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { getPlanById } from '$lib/config/plans';
	import { toaster } from '$lib';
	import {
		ArrowUpRight,
		CreditCard,
		ExternalLink,
		RefreshCw,
		Settings,
		ShieldCheck
	} from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const subscription = $derived(data.subscription);
	const activeStatuses = ['active', 'trialing', 'past_due'];
	const hasActiveSubscription = $derived(
		subscription?.status != null && activeStatuses.includes(subscription.status)
	);
	const planName = $derived(
		hasActiveSubscription ? (getPlanById(subscription?.plan_id)?.name ?? 'Paid Plan') : 'Starter'
	);
	const renewsOn = $derived(
		subscription?.current_period_end && hasActiveSubscription
			? new Date(subscription.current_period_end).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})
			: null
	);

	const checkoutSuccess = $derived(page.url.searchParams.get('checkout') === 'success');
	const notConfiguredError = $derived(
		page.url.searchParams.get('error') === 'not_configured' || !data.stripeConfigured
	);

	// After returning from Stripe Checkout/Portal, refresh load data so the
	// subscription row reflects the latest webhook write.
	afterNavigate(async ({ to }) => {
		if (to?.url.searchParams.get('checkout') === 'success') {
			await invalidateAll();
		}
	});

	async function refresh() {
		await invalidateAll();
		toaster.create({
			type: 'info',
			title: 'Refreshed',
			description: 'Subscription state reloaded. Webhook updates can take a few seconds.'
		});
	}
</script>

<svelte:head>
	<title>Billing - Sveltey</title>
	<meta name="description" content="Manage your subscription, invoices, and payment methods." />
</svelte:head>

<div class="container mx-auto py-20">
	<div class="mx-auto max-w-2xl space-y-8">
		<header class="space-y-4 text-center">
			<div class="mb-4 flex items-center justify-center gap-2">
				<CreditCard class="text-primary-500 size-8" />
				<h1 class="h1">Billing <span class="text-primary-500">&amp; Plan</span></h1>
			</div>
			<p class="text-lg opacity-75">
				Review your subscription and manage payment details through Stripe.
			</p>
		</header>

		{#if checkoutSuccess}
			<div class="card preset-outlined-success-500 space-y-3 p-6">
				<div class="flex items-start gap-3">
					<ShieldCheck class="text-success-500 mt-0.5 size-5 flex-shrink-0" />
					<div class="flex-1 space-y-1">
						<h3 class="text-success-700 dark:text-success-300 font-semibold">
							Payment received — thank you!
						</h3>
						<p class="text-success-600 dark:text-success-400 text-sm">
							Your subscription activates as soon as our webhook processes it (usually seconds). If
							the status below hasn't updated yet, refresh in a moment.
						</p>
						<button
							class="btn btn-sm preset-outlined-success-500 mt-2"
							onclick={refresh}
							aria-label="Refresh subscription status"
						>
							<RefreshCw class="size-3" aria-hidden="true" />
							Refresh Status
						</button>
					</div>
				</div>
			</div>
		{/if}

		{#if notConfiguredError}
			<div class="card preset-outlined-warning-500 space-y-2 p-6">
				<div class="flex items-start gap-3">
					<Settings class="text-warning-500 mt-0.5 size-5 flex-shrink-0" />
					<div class="space-y-1">
						<h3 class="text-warning-700 dark:text-warning-300 font-semibold">
							Stripe is not configured
						</h3>
						<p class="text-warning-600 dark:text-warning-400 text-sm">
							Set <code class="font-mono">STRIPE_SECRET_KEY</code> (and optionally
							<code class="font-mono">STRIPE_WEBHOOK_SECRET</code>) in your environment. See
							<code class="font-mono">docs/PAYMENTS_SETUP.md</code>.
						</p>
					</div>
				</div>
			</div>
		{/if}

		<!-- Current Subscription -->
		<div class="card preset-outlined-primary-500 space-y-6 p-8">
			<div class="flex items-center justify-between gap-4">
				<div>
					<h2 class="h4">Current Plan</h2>
					<p class="mt-1 text-3xl font-bold">{planName}</p>
				</div>
				<span
					class="badge {hasActiveSubscription
						? 'preset-filled-success-500'
						: 'preset-outlined-surface-500'} capitalize"
				>
					{subscription?.status ? subscription.status.replace('_', ' ') : 'free'}
				</span>
			</div>

			{#if hasActiveSubscription}
				<ul class="space-y-2 text-sm">
					{#if renewsOn}
						<li class="flex items-center gap-2">
							<RefreshCw class="size-4 opacity-50" aria-hidden="true" />
							{#if subscription?.cancel_at_period_end}
								Access ends on <strong>{renewsOn}</strong> (cancellation scheduled)
							{:else}
								Renews on <strong>{renewsOn}</strong>
							{/if}
						</li>
					{/if}
					{#if subscription?.stripe_subscription_id}
						<li class="flex items-center gap-2">
							<CreditCard class="size-4 opacity-50" aria-hidden="true" />
							<span class="font-mono text-xs opacity-50">{subscription.stripe_subscription_id}</span
							>
						</li>
					{/if}
				</ul>
			{:else}
				<p class="text-sm opacity-75">
					You're on the free Starter plan. Upgrade any time — payments are processed securely by
					Stripe Checkout.
				</p>
			{/if}

			<div class="flex flex-col gap-4 sm:flex-row">
				<form method="POST" action="/api/stripe/portal">
					<button
						type="submit"
						class="btn preset-filled-primary-500 flex items-center gap-2"
						disabled={!data.stripeConfigured}
						title={data.stripeConfigured
							? 'Opens the Stripe customer portal'
							: 'Configure STRIPE_SECRET_KEY first'}
					>
						<ExternalLink class="size-4" aria-hidden="true" />
						Manage Billing in Stripe
					</button>
				</form>
				<a href="/pricing" class="btn preset-outlined-surface-500 flex items-center gap-2">
					<ArrowUpRight class="size-4" aria-hidden="true" />
					{hasActiveSubscription ? 'Change Plan' : 'Upgrade'}
				</a>
			</div>
		</div>

		<p class="text-center text-xs opacity-50">
			Invoices, payment methods, and cancellations are handled inside the Stripe customer portal.
		</p>
	</div>
</div>
