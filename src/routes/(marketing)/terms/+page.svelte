<script lang="ts">
	import { FileText, Mail, Scale, AlertTriangle, Shield, Users } from '@lucide/svelte';

	const lastUpdated = 'May 28, 2025';
</script>

<div class="container mx-auto max-w-4xl py-20">
	<!-- Header -->
	<header class="mb-16 space-y-6 text-center">
		<div class="mb-4 flex items-center justify-center gap-3">
			<div class="bg-primary-500 flex h-12 w-12 items-center justify-center rounded-lg">
				<Scale class="size-6 text-white" />
			</div>
			<h1 class="h1">Terms of <span class="text-primary-500">Service</span></h1>
		</div>
		<p class="mx-auto max-w-2xl text-xl opacity-75">
			Please read these terms carefully before using our service. By using Sveltey, you agree to
			these terms.
		</p>
		<div class="text-sm opacity-50">Last updated: {lastUpdated}</div>
	</header>

	<!-- Warning Notice -->
	<div class="card preset-outlined-warning-500 mb-12 p-6">
		<div class="flex items-start gap-3">
			<AlertTriangle class="text-warning-500 mt-0.5 size-5 flex-shrink-0" />
			<div class="space-y-2">
				<h3 class="text-warning-700 dark:text-warning-300 font-semibold">Template Notice</h3>
				<p class="text-warning-600 dark:text-warning-400 text-sm">
					These terms of service are a template for demonstration purposes. Please consult with
					legal professionals to create terms that comply with applicable laws and regulations for
					your specific business.
				</p>
			</div>
		</div>
	</div>

	<!-- Quick Navigation -->
	<nav class="card preset-outlined-surface-500 mb-12 p-6">
		<h2 class="h4 mb-4 flex items-center gap-2">
			<FileText class="text-primary-500 size-5" />
			Quick Navigation
		</h2>
		<div class="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
			<a href="#acceptance" class="text-primary-500 hover:text-primary-600 transition-colors"
				>Acceptance of Terms</a
			>
			<a
				href="#service-description"
				class="text-primary-500 hover:text-primary-600 transition-colors">Service Description</a
			>
			<a href="#user-accounts" class="text-primary-500 hover:text-primary-600 transition-colors"
				>User Accounts</a
			>
			<a href="#acceptable-use" class="text-primary-500 hover:text-primary-600 transition-colors"
				>Acceptable Use</a
			>
			<a href="#payment-terms" class="text-primary-500 hover:text-primary-600 transition-colors"
				>Payment Terms</a
			>
			<a href="#termination" class="text-primary-500 hover:text-primary-600 transition-colors"
				>Termination</a
			>
		</div>
	</nav>

	<!-- Main Content -->
	<div class="space-y-12">
		<!-- Acceptance of Terms -->
		<section id="acceptance" class="space-y-6">
			<h2 class="h2 text-primary-500 flex items-center gap-2">
				<Scale class="size-6" />
				Acceptance of Terms
			</h2>

			<div class="card preset-outlined-surface-500 p-6">
				<p class="mb-4 opacity-75">
					By accessing and using the Sveltey SaaS template service ("Service"), you accept and agree
					to be bound by the terms and provision of this agreement.
				</p>
				<p class="opacity-75">
					If you do not agree to abide by the above, please do not use this service.
				</p>
			</div>
		</section>

		<!-- Service Description -->
		<section id="service-description" class="space-y-6">
			<h2 class="h2 text-primary-500 flex items-center gap-2">
				<FileText class="size-6" />
				Service Description
			</h2>

			<div class="space-y-4">
				<div class="card preset-outlined-surface-500 p-6">
					<h3 class="h4 mb-3">What We Provide</h3>
					<p class="opacity-75">
						Sveltey is a comprehensive SaaS template built with SvelteKit, Supabase, and Skeleton
						UI. We provide the codebase, documentation, and support to help you build your SaaS
						application.
					</p>
				</div>

				<div class="card preset-outlined-surface-500 p-6">
					<h3 class="h4 mb-3">Service Availability</h3>
					<p class="opacity-75">
						We strive to maintain high availability of our service, but we do not guarantee
						uninterrupted access. Scheduled maintenance and updates may temporarily affect service
						availability.
					</p>
				</div>
			</div>
		</section>

		<!-- User Accounts -->
		<section id="user-accounts" class="space-y-6">
			<h2 class="h2 text-primary-500 flex items-center gap-2">
				<Users class="size-6" />
				User Accounts
			</h2>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div class="card preset-outlined-surface-500 space-y-4 p-6">
					<h3 class="h4">Account Creation</h3>
					<ul class="space-y-2 text-sm opacity-75">
						<li>• You must provide accurate information</li>
						<li>• You are responsible for account security</li>
						<li>• One account per person or organization</li>
						<li>• Must be 18 years or older</li>
					</ul>
				</div>

				<div class="card preset-outlined-surface-500 space-y-4 p-6">
					<h3 class="h4">Account Responsibilities</h3>
					<ul class="space-y-2 text-sm opacity-75">
						<li>• Keep login credentials secure</li>
						<li>• Notify us of unauthorized access</li>
						<li>• Update account information as needed</li>
						<li>• Comply with all applicable laws</li>
					</ul>
				</div>
			</div>
		</section>

		<!-- Acceptable Use -->
		<section id="acceptable-use" class="space-y-6">
			<h2 class="h2 text-primary-500 flex items-center gap-2">
				<Shield class="size-6" />
				Acceptable Use Policy
			</h2>

			<div class="space-y-4">
				<div class="card preset-filled-success-500 p-6">
					<h3 class="h4 text-success-contrast-500 mb-3 font-bold">Permitted Uses</h3>
					<ul class="space-y-2 text-sm">
						<li>• Building legitimate SaaS applications</li>
						<li>• Learning and educational purposes</li>
						<li>• Commercial use within license terms</li>
						<li>• Customization and modification</li>
					</ul>
				</div>

				<div class="card preset-filled-error-500 p-6">
					<h3 class="h4 text-error-contrast-500 mb-3 font-bold">Prohibited Uses</h3>
					<ul class="space-y-2 text-sm">
						<li>• Illegal or fraudulent activities</li>
						<li>• Harassment or abuse of others</li>
						<li>• Spam or unsolicited communications</li>
						<li>• Malware or security threats</li>
						<li>• Violation of intellectual property rights</li>
					</ul>
				</div>
			</div>
		</section>

		<!-- Payment Terms -->
		<section id="payment-terms" class="space-y-6">
			<h2 class="h2 text-primary-500 flex items-center gap-2">
				<FileText class="size-6" />
				Payment Terms
			</h2>

			<div class="space-y-4">
				<div class="card preset-outlined-surface-500 p-6">
					<h3 class="h4 mb-3">Billing</h3>
					<p class="mb-4 opacity-75">
						Subscription fees are billed in advance on a monthly or annual basis. All fees are
						non-refundable except as required by law.
					</p>
					<ul class="space-y-2 text-sm opacity-75">
						<li>• Automatic renewal unless cancelled</li>
						<li>• Price changes with 30 days notice</li>
						<li>• Taxes may apply based on location</li>
						<li>• Payment methods: Credit card, PayPal</li>
					</ul>
				</div>

				<div class="card preset-outlined-surface-500 p-6">
					<h3 class="h4 mb-3">Refunds</h3>
					<p class="opacity-75">
						We offer a 30-day money-back guarantee for new subscriptions. Refund requests must be
						submitted within 30 days of initial purchase.
					</p>
				</div>
			</div>
		</section>

		<!-- Termination -->
		<section id="termination" class="space-y-6">
			<h2 class="h2 text-primary-500 flex items-center gap-2">
				<AlertTriangle class="size-6" />
				Termination
			</h2>

			<div class="space-y-4">
				<div class="card preset-outlined-surface-500 p-6">
					<h3 class="h4 mb-3">By You</h3>
					<p class="opacity-75">
						You may terminate your account at any time through your account settings. Your access
						will continue until the end of your current billing period.
					</p>
				</div>

				<div class="card preset-outlined-surface-500 p-6">
					<h3 class="h4 mb-3">By Us</h3>
					<p class="opacity-75">
						We may terminate or suspend your account for violation of these terms, non-payment, or
						other reasons with appropriate notice when possible.
					</p>
				</div>
			</div>
		</section>

		<!-- Additional Terms -->
		<section class="space-y-6">
			<h2 class="h2 text-primary-500">Additional Terms</h2>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div class="card preset-outlined-surface-500 space-y-4 p-6">
					<h3 class="h4">Intellectual Property</h3>
					<p class="text-sm opacity-75">
						The Service and its original content remain our property. You retain rights to content
						you create using our template.
					</p>
				</div>

				<div class="card preset-outlined-surface-500 space-y-4 p-6">
					<h3 class="h4">Limitation of Liability</h3>
					<p class="text-sm opacity-75">
						Our liability is limited to the amount paid for the service. We are not liable for
						indirect or consequential damages.
					</p>
				</div>

				<div class="card preset-outlined-surface-500 space-y-4 p-6">
					<h3 class="h4">Governing Law</h3>
					<p class="text-sm opacity-75">
						These terms are governed by the laws of [Your Jurisdiction]. Disputes will be resolved
						in [Your Jurisdiction] courts.
					</p>
				</div>

				<div class="card preset-outlined-surface-500 space-y-4 p-6">
					<h3 class="h4">Changes to Terms</h3>
					<p class="text-sm opacity-75">
						We may update these terms with notice. Continued use constitutes acceptance of new
						terms.
					</p>
				</div>
			</div>
		</section>

		<!-- Contact Information -->
		<section class="space-y-6">
			<h2 class="h2 text-primary-500 flex items-center gap-2">
				<Mail class="size-6" />
				Contact Us
			</h2>

			<div class="card preset-outlined-primary-500 space-y-4 p-8 text-center">
				<p class="opacity-75">
					If you have any questions about these Terms of Service, please don't hesitate to contact
					us.
				</p>
				<div class="flex flex-col justify-center gap-4 sm:flex-row">
					<a href="/contact" class="btn preset-filled-primary-500">
						<Mail class="size-4" />
						Contact Support
					</a>
					<a href="mailto:legal@sveltey.dev" class="btn preset-outlined-surface-500">
						legal@sveltey.dev
					</a>
				</div>
			</div>
		</section>
	</div>
</div>
