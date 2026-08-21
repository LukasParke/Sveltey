<script lang="ts">
	import { enhance } from '$app/forms';
	import { toaster } from '$lib';
	import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();

	let submitting = $state(false);

	// Honeypot field: hidden from humans, filled by bots.
	let website = $state('');

	const fieldErrors = $derived(
		form && 'fieldErrors' in form ? (form.fieldErrors as Record<string, string>) : {}
	);

	$effect(() => {
		if (!form) return;
		if ('error' in form && form.error) {
			toaster.create({ type: 'error', title: 'Message not sent', description: form.error });
		}
		if ('success' in form && form.success) {
			if ('devMode' in form && form.devMode) {
				toaster.create({
					type: 'info',
					title: 'Message received (dev mode)',
					description:
						'RESEND_API_KEY is not configured, so your message was logged to the server console instead of emailed.'
				});
			} else {
				toaster.create({
					type: 'success',
					title: 'Message sent!',
					description: "Thank you for contacting us. We'll get back to you soon."
				});
			}
			website = '';
		}
	});

	function handleFinish() {
		submitting = false;
		if (form && 'success' in form && form.success) {
			// Clear the form after a successful submit.
			const formEl = document.getElementById('contact-form') as HTMLFormElement | null;
			formEl?.reset();
		}
	}
</script>

<div class="container mx-auto py-20">
	<div class="mx-auto max-w-6xl space-y-16">
		<!-- Header -->
		<header class="space-y-4 text-center">
			<div class="mb-4 flex items-center justify-center gap-2">
				<MessageCircle class="text-primary-500 size-8" />
				<h1 class="h1">Get in <span class="text-primary-500">Touch</span></h1>
			</div>
			<p class="max-w-2xl text-xl opacity-75">
				Have questions? We'd love to hear from you. <br /> Send us a message and we'll respond as soon
				as possible.
			</p>
		</header>

		<div class="grid grid-cols-1 gap-12 lg:grid-cols-3">
			<!-- Contact Information -->
			<div class="space-y-8">
				<div class="space-y-6">
					<div class="card preset-outlined-surface-500 space-y-4 p-6">
						<div class="flex items-center gap-3">
							<div class="bg-primary-500 flex h-10 w-10 items-center justify-center rounded-lg">
								<Mail class="size-5 text-white" />
							</div>
							<div>
								<h3 class="font-semibold">Email Us</h3>
								<p class="text-sm opacity-75">support@sveltey.dev</p>
							</div>
						</div>
					</div>

					<div class="card preset-outlined-surface-500 space-y-4 p-6">
						<div class="flex items-center gap-3">
							<div class="bg-secondary-500 flex h-10 w-10 items-center justify-center rounded-lg">
								<Phone class="size-5 text-white" />
							</div>
							<div>
								<h3 class="font-semibold">Call Us</h3>
								<p class="text-sm opacity-75">+1 (555) 123-4567</p>
							</div>
						</div>
					</div>

					<div class="card preset-outlined-surface-500 space-y-4 p-6">
						<div class="flex items-center gap-3">
							<div class="bg-tertiary-500 flex h-10 w-10 items-center justify-center rounded-lg">
								<MapPin class="size-5 text-white" />
							</div>
							<div>
								<h3 class="font-semibold">Visit Us</h3>
								<p class="text-sm opacity-75">San Francisco, CA</p>
							</div>
						</div>
					</div>
				</div>

				<div class="card preset-outlined-primary-500 p-6 text-center">
					<Clock class="mx-auto mb-3 size-8" />
					<h3 class="h4 mb-2">Quick Response</h3>
					<p class="text-sm opacity-90">
						We typically respond within 24 hours during business days.
					</p>
				</div>
			</div>

			<!-- Contact Form -->
			<div class="lg:col-span-2">
				<div class="card preset-outlined-surface-500 p-8">
					<div class="space-y-6">
						<div>
							<h2 class="h3 mb-2">Send us a message</h2>
							<p class="opacity-75">Fill out the form below and we'll get back to you.</p>
						</div>

						{#if form?.error}
							<div class="card preset-outlined-error-500 p-4 text-center">
								<p class="text-error-600 dark:text-error-400 text-sm">{form.error}</p>
							</div>
						{/if}

						<form
							id="contact-form"
							method="POST"
							action="?/send"
							use:enhance={() => {
								submitting = true;
								return async ({ update }) => {
									await update();
									handleFinish();
								};
							}}
							class="space-y-6"
						>
							<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
								<div class="space-y-2">
									<label class="label font-medium" for="name">Name *</label>
									<input
										class="input preset-outlined-surface-500"
										type="text"
										id="name"
										name="name"
										placeholder="Your name"
										required
										maxlength="100"
										disabled={submitting}
									/>
									{#if fieldErrors.name}
										<p class="text-error-500 text-xs">{fieldErrors.name}</p>
									{/if}
								</div>

								<div class="space-y-2">
									<label class="label font-medium" for="email">Email *</label>
									<input
										class="input preset-outlined-surface-500"
										type="email"
										id="email"
										name="email"
										placeholder="your@email.com"
										required
										disabled={submitting}
									/>
									{#if fieldErrors.email}
										<p class="text-error-500 text-xs">{fieldErrors.email}</p>
									{/if}
								</div>
							</div>

							<div class="space-y-2">
								<label class="label font-medium" for="subject">Subject *</label>
								<input
									class="input preset-outlined-surface-500"
									type="text"
									id="subject"
									name="subject"
									placeholder="What can we help you with?"
									required
									maxlength="200"
									disabled={submitting}
								/>
								{#if fieldErrors.subject}
									<p class="text-error-500 text-xs">{fieldErrors.subject}</p>
								{/if}
							</div>

							<div class="space-y-2">
								<label class="label font-medium" for="message">Message *</label>
								<textarea
									class="textarea preset-outlined-surface-500"
									id="message"
									name="message"
									placeholder="Tell us more about your question or feedback..."
									rows="6"
									required
									maxlength="5000"
									disabled={submitting}
								></textarea>
								{#if fieldErrors.message}
									<p class="text-error-500 text-xs">{fieldErrors.message}</p>
								{/if}
							</div>

							<!-- Honeypot: visually hidden from users and assistive tech -->
							<div class="hidden" aria-hidden="true">
								<label for="website">Website</label>
								<input
									type="text"
									id="website"
									name="website"
									tabindex="-1"
									autocomplete="off"
									bind:value={website}
								/>
							</div>

							<button
								type="submit"
								class="btn preset-filled-primary-500 flex w-full items-center justify-center gap-2"
								disabled={submitting}
								aria-label={submitting ? 'Sending message...' : 'Send message'}
							>
								{#if submitting}
									<div
										class="h-4 w-4 animate-spin rounded-full border-b-2 border-white"
										aria-hidden="true"
									></div>
									Sending...
								{:else}
									<Send class="size-4" aria-hidden="true" />
									Send Message
								{/if}
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>

		<!-- FAQ Section -->
		<section class="space-y-8">
			<h2 class="h2 text-center">Frequently Asked Questions</h2>
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
				<div class="space-y-4">
					<h3 class="text-primary-500 h4">How quickly do you respond?</h3>
					<p class="opacity-75">
						We aim to respond to all inquiries within 24 hours during business days. For urgent
						matters, please call us directly.
					</p>
				</div>
				<div class="space-y-4">
					<h3 class="text-primary-500 h4">Do you offer technical support?</h3>
					<p class="opacity-75">
						Yes! We provide comprehensive technical support for all our customers. Premium plans
						include priority support with faster response times.
					</p>
				</div>
				<div class="space-y-4">
					<h3 class="text-primary-500 h4">Can I schedule a demo?</h3>
					<p class="opacity-75">
						Absolutely! Contact us to schedule a personalized demo of our platform. We'll show you
						how our solution can meet your specific needs.
					</p>
				</div>
				<div class="space-y-4">
					<h3 class="text-primary-500 h4">What about custom solutions?</h3>
					<p class="opacity-75">
						We offer custom development and integration services for enterprise clients. Reach out
						to discuss your specific requirements.
					</p>
				</div>
			</div>
		</section>
	</div>
</div>
