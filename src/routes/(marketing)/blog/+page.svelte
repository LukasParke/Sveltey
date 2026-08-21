<script lang="ts">
	import { Calendar, User, Tag, BookOpen, Star } from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};
</script>

<div class="container mx-auto space-y-20 py-20">
	<!-- Header -->
	<header class="mx-auto max-w-3xl space-y-4 text-center">
		<div class="mb-4 flex items-center justify-center gap-2">
			<BookOpen class="text-primary-500 size-8" />
			<h1 class="h1">Our <span class="text-primary-500">Blog</span></h1>
		</div>
		<p class="text-2xl opacity-75">
			Insights, tutorials, and updates from our team. Stay up to date with the latest in SaaS
			development and best practices.
		</p>
	</header>

	{#if data.posts && data.posts.length > 0}
		<hr class="hr mx-auto max-w-48" />

		<!-- Featured Posts -->
		{@const featuredPosts = data.posts.filter((post) => post.featured)}
		{#if featuredPosts.length > 0}
			<section class="space-y-8">
				<div class="flex items-center gap-2">
					<Star class="text-primary-500 size-6" />
					<h2 class="h2">Featured Posts</h2>
				</div>
				<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
					{#each featuredPosts as post (post.slug)}
						<a
							href="/blog/{post.slug}"
							class="card preset-outlined-primary-500 group flex flex-col space-y-4 p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl md:p-8"
						>
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-1 text-sm opacity-75">
									<Calendar class="size-4" />
									{formatDate(post.publishedAt)}
								</div>
							</div>

							<h3 class="h3 group-hover:text-primary-500 transition-colors">
								<div class="block">
									{post.title}
								</div>
							</h3>

							<p class="grow opacity-75">{post.excerpt}</p>

							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<User class="size-4 opacity-50" />
									<span class="text-sm opacity-75">{post.author}</span>
								</div>
								<div class="flex flex-wrap gap-1">
									{#each post.tags.slice(0, 2) as tag (tag)}
										<span class="badge preset-outlined-surface-500 flex items-center gap-1 text-xs">
											<Tag class="size-3" />
											{tag}
										</span>
									{/each}
								</div>
							</div>
						</a>
					{/each}
				</div>
			</section>

			<hr class="hr mx-auto max-w-48" />
		{/if}

		<!-- All Posts -->
		{@const regularPosts = data.posts.filter((post) => !post.featured)}
		{#if regularPosts.length > 0}
			<section class="space-y-8">
				<h2 class="h2 text-center">Recent Posts</h2>
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each regularPosts as post (post.slug)}
						<a
							href="/blog/{post.slug}"
							class="card preset-outlined-primary-500 group space-y-4 p-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl md:p-6"
						>
							<div class="flex items-center gap-1 text-sm opacity-75">
								<Calendar class="size-4" />
								{formatDate(post.publishedAt)}
							</div>

							<h3 class="h4 group-hover:text-primary-500 transition-colors">
								<div class="block">
									{post.title}
								</div>
							</h3>

							<p class="text-sm opacity-75">{post.excerpt}</p>

							<div class="space-y-3">
								<div class="flex items-center gap-2">
									<User class="size-4 opacity-50" />
									<span class="text-sm opacity-75">{post.author}</span>
								</div>
								{#if post.tags.length > 0}
									<div class="flex flex-wrap gap-1">
										{#each post.tags.slice(0, 3) as tag (tag)}
											<span
												class="badge preset-outlined-surface-500 flex items-center gap-1 text-xs"
											>
												<Tag class="size-3" />
												{tag}
											</span>
										{/each}
									</div>
								{/if}
							</div>
						</a>
					{/each}
				</div>
			</section>
		{/if}
	{:else}
		<div
			class="card preset-outlined-surface-500 mx-auto max-w-2xl space-y-4 p-8 text-center md:p-12"
		>
			<BookOpen class="text-primary-500 mx-auto size-16 opacity-50" />
			<h2 class="h3">No blog posts yet</h2>
			<p class="opacity-75">
				We're working on some great content for you. Check back soon for insights, tutorials, and
				updates!
			</p>
		</div>
	{/if}
</div>
