<script lang="ts">
	import type { Component } from 'svelte';
	import { Calendar, User, Tag, Share2, ArrowLeft, Star } from '@lucide/svelte';
	import XIcon from '$lib/components/icons/XIcon.svelte';
	import LinkedInIcon from '$lib/components/icons/LinkedInIcon.svelte';

	let { data } = $props();

	let post = $derived(data.post);
	let Content = $derived(post?.content as Component | undefined);
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};
</script>

<div class="container mx-auto max-w-4xl space-y-12 py-20">
	<!-- Breadcrumb Navigation -->
	<nav class="flex items-center gap-2 text-sm">
		<a href="/" class="hover:text-primary-500 transition-colors">Home</a>
		<span class="opacity-50">/</span>
		<a href="/blog" class="hover:text-primary-500 transition-colors">Blog</a>
		<span class="opacity-50">/</span>
		<span class="opacity-75">{post.title}</span>
	</nav>

	<!-- Article Header -->
	<header class="space-y-8">
		<!-- Featured Badge & Meta Info -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				{#if post.featured}
					<span class="badge preset-filled-primary-500 flex items-center gap-1">
						<Star class="size-3" />
						Featured
					</span>
				{/if}
				<div class="flex items-center gap-1 text-sm opacity-75">
					<Calendar class="size-4" />
					{formatDate(post.publishedAt)}
				</div>
			</div>

			<!-- Back to Blog -->
			<a href="/blog" class="btn preset-outlined-surface-200-800 flex items-center gap-2">
				<ArrowLeft class="size-4" />
				<span>Back to Blog</span>
			</a>
		</div>

		<!-- Title and Excerpt -->
		<div class="space-y-4">
			<h1 class="h1">{post.title}</h1>
			<p class="text-xl leading-relaxed opacity-75">{post.excerpt}</p>
		</div>

		<!-- Author and Tags -->
		<div class="card preset-outlined-primary-500 space-y-4 p-6">
			<div class="flex flex-wrap items-center justify-between gap-4">
				<div class="flex items-center gap-2">
					<User class="text-primary-500 size-5" />
					<span class="font-medium">{post.author}</span>
				</div>

				<!-- Share Buttons -->
				<div class="flex items-center gap-2">
					<Share2 class="size-4 opacity-50" />
					<span class="mr-2 text-sm opacity-75">Share:</span>
					<a
						href="https://twitter.com/intent/tweet?text={encodeURIComponent(
							post.title
						)}&url={encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}"
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-sm preset-outlined-secondary-500"
						title="Share on Twitter"
						aria-label="Share this article on Twitter"
					>
						<XIcon class="size-4" />
					</a>
					<a
						href="https://www.linkedin.com/sharing/share-offsite/?url={encodeURIComponent(
							typeof window !== 'undefined' ? window.location.href : ''
						)}"
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-sm preset-outlined-secondary-500"
						title="Share on LinkedIn"
						aria-label="Share this article on LinkedIn"
					>
						<LinkedInIcon class="size-4" />
					</a>
					<a
						href="https://bsky.app/intent/compose?text={encodeURIComponent(
							post.title + '\n\n' + (typeof window !== 'undefined' ? window.location.href : '')
						)}"
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-sm preset-outlined-secondary-500"
						title="Share on Bluesky"
						aria-label="Share this article on Bluesky"
					>
						<svg class="size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 568 501"
							><title>Bluesky butterfly logo</title><path
								fill="currentColor"
								d="M123.121 33.664C188.241 82.553 258.281 181.68 284 234.873c25.719-53.192 95.759-152.32 160.879-201.21C491.866-1.611 568-28.906 568 57.947c0 17.346-9.945 145.713-15.778 166.555-20.275 72.453-94.155 90.933-159.875 79.748C507.222 323.8 536.444 388.56 473.333 453.32c-119.86 122.992-172.272-30.859-185.702-70.281-2.462-7.227-3.614-10.608-3.631-7.733-.017-2.875-1.169.506-3.631 7.733-13.43 39.422-65.842 193.273-185.702 70.281-63.111-64.76-33.89-129.52 80.986-149.071-65.72 11.185-139.6-7.295-159.875-79.748C9.945 203.659 0 75.291 0 57.946 0-28.906 76.135-1.612 123.121 33.664Z"
								data-darkreader-inline-fill=""
								style="--darkreader-inline-fill: currentColor;"
							></path></svg
						>
					</a>
				</div>
			</div>

			{#if post.tags.length > 0}
				<div class="flex flex-wrap items-center gap-2">
					<Tag class="text-primary-500 size-4" />
					<span class="text-sm font-medium">Tags:</span>
					{#each post.tags as tag (tag)}
						<span class="badge preset-outlined-tertiary-500 flex items-center gap-1 text-xs">
							{tag}
						</span>
					{/each}
				</div>
			{/if}
		</div>
	</header>

	<hr class="hr bg-primary-500" />

	<!-- Article Content -->
	<article class="prose dark:prose-invert prose-lg max-w-none">
		<div
			class="prose dark:prose-invert prose-lg prose-headings:text-primary-500 prose-links:text-primary-500 prose-code:text-primary-500 max-w-none"
		>
			{#if Content}
				<Content />
			{/if}
		</div>
	</article>

	<hr class="hr" />

	<!-- Article Footer -->
	<footer class="space-y-8">
		<!-- Navigation -->
		<div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
			<a href="/blog" class="btn preset-filled-primary-500 flex items-center gap-2">
				<ArrowLeft class="size-4" />
				<span>More Articles</span>
			</a>

			<!-- Share Section (Repeated for convenience) -->
			<div class="flex items-center gap-2">
				<span class="text-sm font-medium opacity-75">Share this article:</span>
				<a
					href="https://twitter.com/intent/tweet?text={encodeURIComponent(
						post.title
					)}&url={encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}"
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-sm preset-outlined-surface-200-800"
					aria-label="Share this article on Twitter"
				>
					<XIcon class="size-4" />
					<span>Twitter</span>
				</a>
				<a
					href="https://www.linkedin.com/sharing/share-offsite/?url={encodeURIComponent(
						typeof window !== 'undefined' ? window.location.href : ''
					)}"
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-sm preset-outlined-surface-200-800"
					aria-label="Share this article on LinkedIn"
				>
					<LinkedInIcon class="size-4" />
					<span>LinkedIn</span>
				</a>
			</div>
		</div>

		<!-- Call to Action -->
		<div class="card preset-outlined-primary-500 space-y-4 p-8 text-center">
			<h3 class="h3 text-primary-500">Ready to get started?</h3>
			<p class="opacity-75">
				Start building your SaaS with our comprehensive template and join thousands of developers.
			</p>
			<div class="flex flex-col justify-center gap-4 sm:flex-row">
				<a href="/auth/signup" class="btn preset-filled-primary-500"> Get Started Free </a>
				<a href="/pricing" class="btn preset-outlined-surface-200-800"> View Pricing </a>
			</div>
		</div>
	</footer>
</div>
