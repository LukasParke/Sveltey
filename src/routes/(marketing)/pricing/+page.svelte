<script lang="ts">
	import { page } from '$app/state';
	import { plans, formatPrice } from '$lib/config/plans';
	import { Check, Crown, Settings, Star, X, Zap } from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const checkoutStatus = $derived(page.url.searchParams.get('checkout'));

	const currentPlanId = $derived(data.subscription?.plan_id ?? 'starter');
	const activeStatuses = ['active', 'trialing', 'past_due'];
	const hasActiveSubscription = $derived(
		data.subscription?.status != null && activeStatuses.includes(data.subscription.status)
	);
	const checkoutError = $derived(
		checkoutStatus === 'not_configured'
			? 'Stripe is not configured yet — set STRIPE_SECRET_KEY to enable checkout.'
			: checkoutStatus === 'invalid_plan'
				? 'That plan could not be found.'
				: checkoutStatus === 'error'
					? 'Something went wrong starting checkout. Please try again.'
					: null
	);
</script>

<div class="container mx-auto space-y-20 py-20">
	<!-- Header -->
	<header class="mx-auto max-w-3xl space-y-4 text-center">
		<h1 class="h1">Simple, <span class="text-primary-500">Transparent</span> Pricing</h1>
		<p class="text-2xl opacity-75">
			Choose the perfect plan for your needs. Start free and scale as you grow. No hidden fees, no
			surprises.
		</p>
	</header>

	{#if !data.stripeConfigured}
		<div class="card preset-outlined-warning-500 mx-auto max-w-3xl space-y-2 p-6">
			<div class="flex items-start gap-3">
				<Settings class="text-warning-500 mt-0.5 size-5 flex-shrink-0" />
				<div class="space-y-1">
					<h3 class="text-warning-700 dark:text-warning-300 font-semibold">
						Payments not configured
					</h3>
					<p class="text-warning-600 dark:text-warning-400 text-sm">
						Set <code class="font-mono">STRIPE_SECRET_KEY</code> in your environment to enable
						checkout. See <code class="font-mono">docs/PAYMENTS_SETUP.md</code> for the full setup.
					</p>
				</div>
			</div>
		</div>
	{/if}

	{#if checkoutError}
		<div class="card preset-outlined-error-500 mx-auto max-w-3xl p-4 text-center">
			<p class="text-error-600 dark:text-error-400 text-sm">{checkoutError}</p>
		</div>
	{/if}

	<hr class="hr mx-auto max-w-48" />

	<!-- Pricing Cards -->
	<section class="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-3">
		{#each plans as plan (plan.id)}
			{@const isCurrent = hasActiveSubscription && plan.id === currentPlanId}
			{@const canCheckout = data.stripeConfigured && plan.priceCents > 0 && !isCurrent}
			<div
				class="card {plan.popular
					? 'preset-outlined-primary-500 relative scale-105 shadow-2xl'
					: 'preset-outlined-secondary-500 hover:scale-105 hover:shadow-2xl'} flex flex-col space-y-6 p-6 transition-all duration-300 md:p-8"
			>
				{#if plan.popular}
					<div class="absolute -top-4 left-1/2 -translate-x-1/2 transform">
						<span class="badge preset-filled-primary-500 flex items-center gap-1">
							<Star class="size-3" />
							Most Popular
						</span>
					</div>
				{/if}

				{#if isCurrent}
					<div class="absolute -top-4 left-1/2 -translate-x-1/2 transform">
						<span class="badge preset-filled-success-500 flex items-center gap-1">
							<Check class="size-3" />
							Your Plan
						</span>
					</div>
				{/if}

				<!-- Plan Header -->
				<div class="space-y-2 text-center">
					<div class="flex items-center justify-center gap-2">
						{#if plan.id === 'starter'}
							<Zap class="text-primary-500 size-6" />
						{:else if plan.id === 'pro'}
							<Star class="text-primary-500 size-6" />
						{:else}
							<Crown class="text-primary-500 size-6" />
						{/if}
						<h3 class="h3 {plan.popular ? 'text-primary-500' : ''}">{plan.name}</h3>
					</div>
					<p class="text-sm opacity-75">{plan.description}</p>
				</div>

				<!-- Price -->
				<div class="space-y-1 text-center">
					<div class="flex items-baseline justify-center gap-1">
						<span class="text-5xl font-bold">{formatPrice(plan.priceCents)}</span>
						<span class="text-lg opacity-75">/mo</span>
					</div>
					{#if plan.priceCents > 0}
						<p class="text-sm opacity-50">Billed monthly via Stripe</p>
					{:else}
						<p class="text-sm opacity-50">Free forever</p>
					{/if}
				</div>

				<!-- Features -->
				<ul class="grow space-y-3">
					{#each plan.features as feature (feature.name)}
						<li class="flex items-center gap-3">
							{#if feature.included}
								<Check class="text-success-500 size-5 flex-shrink-0" aria-hidden="true" />
							{:else}
								<X class="text-error-500 size-5 flex-shrink-0" aria-hidden="true" />
							{/if}
							<span class={feature.included ? '' : 'opacity-50'}>{feature.name}</span>
						</li>
					{/each}
				</ul>

				<!-- CTA -->
				{#if plan.priceCents === 0}
					<a
						href={data.session ? '/app/dashboard' : '/auth/register?next=%2Fpricing'}
						class="btn w-full {isCurrent
							? 'preset-outlined-surface-500 cursor-default'
							: 'preset-outlined-primary-500'}"
						aria-label="{isCurrent ? 'Your current plan' : 'Get started'} - {plan.name} plan"
					>
						{#if isCurrent}
							Your Current Plan
						{:else if data.session}
							Included by Default
						{:else}
							Get Started Free
						{/if}
					</a>
				{:else if canCheckout}
					<form method="POST" action="/api/stripe/checkout">
						<input type="hidden" name="plan" value={plan.id} />
						<button
							type="submit"
							class="btn w-full {plan.popular
								? 'preset-filled-primary-500'
								: 'preset-outlined-primary-500'}"
							aria-label="Subscribe to the {plan.name} plan"
						>
							Subscribe to {plan.name}
						</button>
					</form>
				{:else}
					<button
						type="button"
						class="btn preset-outlined-surface-500 w-full opacity-60"
						disabled
						title={!data.stripeConfigured
							? 'Configure STRIPE_SECRET_KEY to enable checkout'
							: 'You are already subscribed to this plan'}
					>
						{#if isCurrent}
							Your Current Plan
						{:else if !data.stripeConfigured}
							Checkout Unavailable
						{:else}
							Manage in Billing
						{/if}
					</button>
				{/if}
			</div>
		{/each}
	</section>

	<hr class="hr mx-auto max-w-48" />

	<!-- FAQ Section -->
	<section class="mx-auto max-w-4xl space-y-8">
		<h2 class="h2 text-center">Frequently Asked Questions</h2>
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
			<div class="space-y-4">
				<h3 class="text-primary-500 h4">Can I change plans anytime?</h3>
				<p class="opacity-75">
					Yes! Open the customer portal from your billing page to upgrade, downgrade, or cancel at
					any time. Changes take effect on your next billing cycle.
				</p>
			</div>
			<div class="space-y-4">
				<h3 class="text-primary-500 h4">How are payments processed?</h3>
				<p class="opacity-75">
					All payments are handled natively through Stripe Checkout — we never see or store your
					card details. Manage invoices and payment methods in the Stripe customer portal.
				</p>
			</div>
			<div class="space-y-4">
				<h3 class="text-primary-500 h4">What payment methods do you accept?</h3>
				<p class="opacity-75">
					We accept all major credit and debit cards. Additional methods available in your region
					are shown at checkout.
				</p>
			</div>
			<div class="space-y-4">
				<h3 class="text-primary-500 h4">Do you offer refunds?</h3>
				<p class="opacity-75">
					Cancel anytime from the billing portal and you keep access until the end of the period
					you've paid for. Contact support for special refund cases.
				</p>
			</div>
		</div>
	</section>

	<hr class="hr mx-auto max-w-48" />

	<!-- Contact Section -->
	<section class="mx-auto grid max-w-4xl grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto]">
		<div class="space-y-2 text-center md:text-left">
			<h3 class="h3">Need a custom solution?</h3>
			<p class="opacity-75">
				Enterprise teams with specific requirements can get in touch for custom pricing and
				features.
			</p>
		</div>
		<a href="/contact" class="btn btn-lg preset-filled-secondary-500">
			<Star class="size-5" />
			<span>Contact Sales</span>
		</a>
	</section>
</div>
