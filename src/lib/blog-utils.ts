import type { BlogPost, BlogPostMetadata } from './blog';

/**
 * Utility functions for blog content management
 */

// Generate a URL-friendly slug from a title
export const generateSlug = (title: string): string => {
	return title
		.toLowerCase()
		.replace(/[^\w\s-]/g, '') // Remove special characters
		.replace(/\s+/g, '-') // Replace spaces with hyphens
		.replace(/-+/g, '-') // Replace multiple hyphens with single
		.trim()
		.replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Format date for frontmatter
export const formatDate = (date: Date): string => {
	return date.toISOString().split('T')[0];
};

// Create blog post template
export const createPostTemplate = (title: string, author: string = 'Author'): string => {
	const slug = generateSlug(title);
	const publishedAt = formatDate(new Date());

	return `---
title: "${title}"
slug: "${slug}"
excerpt: "Add a compelling excerpt for your blog post here."
publishedAt: "${publishedAt}"
author: "${author}"
tags: ["tag1", "tag2"]
featured: false
---

# ${title}

Your blog post content goes here. You can use all standard Markdown features:

## Headings

### Subheadings

#### Smaller headings

## Lists

- Bullet point 1
- Bullet point 2
- Bullet point 3

1. Numbered item 1
2. Numbered item 2
3. Numbered item 3

## Code Examples

\`\`\`javascript
// JavaScript code example
const example = () => {
  console.log('Hello, world!');
};
\`\`\`

## Links and Images

[Link to external site](https://example.com)

## Blockquotes

> This is a blockquote. Use it for highlighting important information or quotes.

## Tables

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |

## Conclusion

Wrap up your blog post with a compelling conclusion.
`;
};

// Validate blog post metadata
export const validatePostMetadata = (metadata: Partial<BlogPost | BlogPostMetadata>): string[] => {
	const errors: string[] = [];

	if (!metadata.title?.trim()) {
		errors.push('Title is required');
	}

	if (!metadata.slug?.trim()) {
		errors.push('Slug is required');
	}

	if (!metadata.excerpt?.trim()) {
		errors.push('Excerpt is required');
	}

	if (!metadata.publishedAt?.trim()) {
		errors.push('Published date is required');
	} else {
		const date = new Date(metadata.publishedAt);
		if (isNaN(date.getTime())) {
			errors.push('Published date must be a valid date');
		}
	}

	if (!metadata.author?.trim()) {
		errors.push('Author is required');
	}

	if (!metadata.tags || !Array.isArray(metadata.tags) || metadata.tags.length === 0) {
		errors.push('At least one tag is required');
	}

	return errors;
};

// Search posts by keyword (works with both BlogPost and BlogPostMetadata)
export const searchPosts = <T extends BlogPost | BlogPostMetadata>(
	posts: T[],
	keyword: string
): T[] => {
	const searchTerm = keyword.toLowerCase();

	return posts.filter(
		(post) =>
			post.title.toLowerCase().includes(searchTerm) ||
			post.excerpt.toLowerCase().includes(searchTerm) ||
			post.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
			post.author.toLowerCase().includes(searchTerm)
	);
};

// Group posts by year (works with both BlogPost and BlogPostMetadata)
export const groupPostsByYear = <T extends BlogPost | BlogPostMetadata>(
	posts: T[]
): Record<string, T[]> => {
	return posts.reduce(
		(groups, post) => {
			const year = new Date(post.publishedAt).getFullYear().toString();
			if (!groups[year]) {
				groups[year] = [];
			}
			groups[year].push(post);
			return groups;
		},
		{} as Record<string, T[]>
	);
};

// Get related posts based on tags (works with metadata only for performance)
export const getRelatedPosts = (
	currentPost: BlogPost | BlogPostMetadata,
	allPosts: BlogPostMetadata[],
	limit: number = 3
): BlogPostMetadata[] => {
	const related = allPosts
		.filter((post) => post.slug !== currentPost.slug)
		.map((post) => {
			const commonTags = post.tags.filter((tag) => currentPost.tags.includes(tag));
			return { post, score: commonTags.length };
		})
		.filter((item) => item.score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, limit)
		.map((item) => item.post);

	// If we don't have enough related posts, fill with recent posts
	if (related.length < limit) {
		const recentPosts = allPosts
			.filter((post) => post.slug !== currentPost.slug)
			.filter((post) => !related.includes(post))
			.slice(0, limit - related.length);

		related.push(...recentPosts);
	}

	return related;
};
