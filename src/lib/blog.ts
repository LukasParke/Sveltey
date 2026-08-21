import { dev } from '$app/environment';

export interface BlogPost {
	title: string;
	slug: string;
	excerpt: string;
	publishedAt: string;
	author: string;
	tags: string[];
	featured: boolean;
	content?: unknown; // Optional since not always needed
}

export interface BlogPostMetadata {
	title: string;
	slug: string;
	excerpt: string;
	publishedAt: string;
	author: string;
	tags: string[];
	featured: boolean;
}

// Get all blog post files
const allPostFiles = import.meta.glob('$lib/posts/*.md') as Record<string, PostModule>;

/** Coerce unknown frontmatter values to strings with a fallback. */
const strField = (value: unknown, fallback: string): string =>
	typeof value === 'string' && value.length > 0 ? value : fallback;

const tagsField = (value: unknown): string[] =>
	Array.isArray(value) ? value.filter((tag): tag is string => typeof tag === 'string') : [];

const slugFromFilename = (filename: string): string =>
	filename.split('/').pop()?.replace('.md', '') ?? '';

const normalizeMetadata = (
	metadata: Record<string, unknown>,
	filename: string
): BlogPostMetadata => ({
	title: strField(metadata.title, 'Untitled'),
	slug: strField(metadata.slug, slugFromFilename(filename)),
	excerpt: strField(metadata.excerpt, ''),
	publishedAt: strField(metadata.publishedAt, new Date().toISOString().split('T')[0]),
	author: strField(metadata.author, 'Anonymous'),
	tags: tagsField(metadata.tags),
	featured: metadata.featured === true
});

type PostModule = () => Promise<{ metadata: Record<string, unknown>; default: unknown }>;

// Parse frontmatter and extract metadata only (no content rendering)
const parsePostMetadataOnly = async (
	filename: string,
	module: PostModule
): Promise<BlogPostMetadata> => {
	const { metadata } = await module();
	return normalizeMetadata(metadata, filename);
};

// Parse frontmatter and extract metadata with content
const parsePostWithContent = async (filename: string, module: PostModule): Promise<BlogPost> => {
	const { metadata, default: content } = await module();

	return {
		...normalizeMetadata(metadata, filename),
		content
	};
};

// Get all posts metadata only (cheap operation for listing)
export const getAllPosts = async (): Promise<BlogPostMetadata[]> => {
	const posts: BlogPostMetadata[] = [];

	for (const [filename, module] of Object.entries(allPostFiles)) {
		try {
			const post = await parsePostMetadataOnly(filename, module);
			// Only include posts with valid publish dates
			if (post.publishedAt && new Date(post.publishedAt) <= new Date()) {
				posts.push(post);
			}
		} catch (error) {
			if (dev) {
				console.error(`Error loading post metadata ${filename}:`, error);
			}
		}
	}

	// Sort by publication date (newest first)
	return posts.sort(
		(a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
	);
};

// Get a single post with full content by slug
export const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
	for (const [filename, module] of Object.entries(allPostFiles)) {
		try {
			// First check metadata to see if this is the right post
			const metadata = await parsePostMetadataOnly(filename, module);

			if (metadata.slug === slug) {
				// Only if we found the right post, load the full content
				const fullPost = await parsePostWithContent(filename, module);

				// Check if post should be published
				if (fullPost.publishedAt && new Date(fullPost.publishedAt) <= new Date()) {
					return fullPost;
				}
			}
		} catch (error) {
			if (dev) {
				console.error(`Error loading post ${filename}:`, error);
			}
		}
	}

	return null;
};

// Get featured posts metadata only (cheap operation)
export const getFeaturedPosts = async (): Promise<BlogPostMetadata[]> => {
	const posts = await getAllPosts();
	return posts.filter((post) => post.featured);
};

// Get posts by tag metadata only (cheap operation)
export const getPostsByTag = async (tag: string): Promise<BlogPostMetadata[]> => {
	const posts = await getAllPosts();
	return posts.filter((post) => post.tags.includes(tag));
};

// Get all unique tags (metadata only)
export const getAllTags = async (): Promise<string[]> => {
	const posts = await getAllPosts();
	const tagSet = new Set<string>();

	posts.forEach((post) => {
		post.tags.forEach((tag) => tagSet.add(tag));
	});

	return Array.from(tagSet).sort();
};
