# Markdown Blog Setup with MDSvex (Svelte 5 Compatible)

This project uses a static markdown-based blog system powered by MDSvex for SvelteKit. This implementation is optimized for Svelte 5 and uses component-based rendering instead of HTML content strings.

## Features

- ✅ **Markdown Support**: Write posts in markdown with full syntax support
- ✅ **Frontmatter Metadata**: YAML frontmatter for post metadata
- ✅ **Featured Posts**: Mark posts as featured for special display
- ✅ **Tags & Categories**: Organize posts with tags
- ✅ **SEO Optimized**: Automatic meta tags and Open Graph support
- ✅ **Responsive Design**: Mobile-friendly blog layout
- ✅ **Syntax Highlighting**: Code blocks with Shiki highlighting
- ✅ **Table of Contents**: Automatic TOC generation
- ✅ **Svelte 5 Compatible**: Uses component-based rendering

## File Structure

```
src/
├── lib/
│   ├── posts/                           # Markdown blog posts
│   │   ├── getting-started.md
│   │   ├── advanced-features.md
│   │   └── building-integrations.md
│   ├── components/
│   │   └── MDXLayout.svelte            # Layout for mdx content
│   ├── blog.ts                         # Blog utilities and types
│   └── blog-utils.ts                   # Helper functions
├── routes/
│   └── blog/
│       ├── +page.svelte                # Blog index page
│       ├── +page.server.ts             # Load all posts
│       └── [slug]/
│           ├── +page.svelte            # Individual post page
│           └── +page.server.ts         # Load single post
└── docs/
    └── BLOG_SETUP.md                   # This documentation
```

## Creating Blog Posts

### 1. Create a New Markdown File

Create a new `.md` file in `src/lib/posts/`:

```bash
touch src/lib/posts/my-new-post.md
```

### 2. Add Frontmatter

Start your post with YAML frontmatter:

```markdown
---
title: 'My Awesome Blog Post'
slug: 'my-awesome-blog-post'
excerpt: 'A compelling description of your blog post that will appear in listings and meta tags.'
publishedAt: '2024-01-30'
author: 'Your Name'
tags: ['tutorial', 'sveltekit', 'web-development']
featured: true
---

# My Awesome Blog Post

Your content goes here...
```

### 3. Write Your Content

Use standard Markdown syntax for your blog post content:

````markdown
## Section Heading

This is a paragraph with **bold** and _italic_ text.

### Code Examples

```javascript
const example = () => {
	console.log('Hello from my blog!');
};
```
````

### Lists

- Item 1
- Item 2
- Item 3

### Links

Check out [SvelteKit](https://kit.svelte.dev) for more information.

````

## Frontmatter Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ | Post title displayed in listings and page title |
| `slug` | string | ✅ | URL-friendly identifier for the post |
| `excerpt` | string | ✅ | Short description for listings and meta tags |
| `publishedAt` | string | ✅ | Publication date in YYYY-MM-DD format |
| `author` | string | ✅ | Author name |
| `tags` | array | ✅ | Array of tags for categorization |
| `featured` | boolean | ❌ | Whether to feature this post (default: false) |

## Svelte 5 Integration

### Component-Based Rendering

This implementation uses Svelte 5's component system. Each markdown file is compiled to a Svelte component:

```typescript
export interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  author: string;
  tags: string[];
  featured: boolean;
  component?: any; // The Svelte component for rendering
}
````

### Rendering Posts

Posts are rendered using `svelte:component`:

```svelte
<!-- In the blog post page -->
{#if post.component}
	<svelte:component this={post.component} />
{:else}
	<p>Content not available.</p>
{/if}
```

## Blog Utilities

### Available Functions

The blog system provides several utility functions in `src/lib/blog.ts`:

```typescript
// Get all published posts
const posts = await getAllPosts();

// Get a specific post by slug
const post = await getPostBySlug('my-post-slug');

// Get featured posts only
const featured = await getFeaturedPosts();

// Get posts with a specific tag
const tagged = await getPostsByTag('tutorial');

// Get all unique tags
const tags = await getAllTags();
```

### Helper Functions

Additional utilities in `src/lib/blog-utils.ts`:

```typescript
// Generate URL-friendly slug from title
const slug = generateSlug('My Blog Post Title');

// Create a new post template
const template = createPostTemplate('New Post', 'Author Name');

// Validate post metadata
const errors = validatePostMetadata(postData);

// Search posts
const results = searchPosts(allPosts, 'keyword');

// Get related posts
const related = getRelatedPosts(currentPost, allPosts, 3);
```

## Styling and Layout

### Custom Prose Styles

The blog uses Tailwind's typography plugin with custom styling:

```css
.prose {
	@apply text-surface-900-50-token max-w-none;
}

.prose h1 {
	@apply mb-6 text-3xl font-bold;
}

.prose code {
	@apply bg-surface-200 dark:bg-surface-700 rounded px-1 py-0.5;
}
```

### MDX Layout Component

The `MDXLayout.svelte` component provides consistent styling for markdown content and can be customized for your design needs.

## Configuration

### MDSvex Configuration

The markdown processing is configured in `svelte.config.js`:

```javascript
const mdsvexOptions = {
	extensions: ['.md'],
	layout: {
		_: './src/lib/components/MDXLayout.svelte'
	},
	remarkPlugins: [remarkUnwrapImages, remarkToc, remarkAbbr],
	rehypePlugins: [rehypeSlug],
	highlight: {
		highlighter: async (code, lang) => {
			const shiki = await import('shiki');
			const highlighter = await shiki.getHighlighter({
				themes: ['github-dark', 'github-light'],
				langs: [
					'javascript',
					'typescript',
					'html',
					'css',
					'svelte',
					'bash',
					'json',
					'yaml',
					'python',
					'rust',
					'go'
				]
			});

			const html = highlighter.codeToHtml(code, {
				lang,
				themes: {
					light: 'github-light',
					dark: 'github-dark'
				}
			});

			return html;
		}
	}
};
```

### Available Plugins

- **remark-unwrap-images**: Removes paragraph wrappers around images
- **remark-toc**: Generates table of contents from headings
- **remark-abbr**: Processes abbreviation definitions
- **rehype-slug**: Adds IDs to headings for anchor links
- **shiki**: Syntax highlighting for code blocks

## SEO Features

### Automatic Meta Tags

Each blog post automatically generates:

- Page title with post title
- Meta description from excerpt
- Open Graph tags for social sharing
- Article metadata (published date, author, tags)

### Example Generated Meta Tags

```html
<title>My Blog Post | Blog</title>
<meta name="description" content="Post excerpt here" />
<meta property="og:title" content="My Blog Post" />
<meta property="og:description" content="Post excerpt here" />
<meta property="og:type" content="article" />
<meta property="article:published_time" content="2024-01-30" />
<meta property="article:author" content="Author Name" />
<meta property="article:tag" content="tutorial" />
```

## Development Workflow

### 1. Create New Post

```bash
# Create new post file
touch src/lib/posts/my-new-post.md

# Add frontmatter and content
# The post will automatically appear in the blog
```

### 2. Preview Posts

Posts are automatically available at:

- Blog index: `/blog`
- Individual post: `/blog/your-post-slug`

### 3. Manage Content

- Posts are automatically sorted by publication date
- Only posts with `publishedAt` dates in the past are shown
- Featured posts appear in a special section

## Advanced Features

### Custom Components in Markdown

You can use Svelte components in your markdown:

```markdown
<script>
  import MyComponent from '$lib/components/MyComponent.svelte';
</script>

# My Post

Here's a custom component:

<MyComponent prop="value" />
```

### Dynamic Imports

Posts are loaded dynamically using Vite's `import.meta.glob()`:

```typescript
const allPostFiles = import.meta.glob('/src/lib/posts/*.md');
```

### Build-Time Processing

All markdown processing happens at build time, ensuring:

- Fast page loads
- SEO-friendly static HTML
- No runtime markdown parsing overhead

## Svelte 5 Compatibility

### Key Differences from Previous Versions

1. **Component-based rendering**: Instead of HTML strings, posts are Svelte components
2. **No server-side rendering of content**: Content is rendered client-side as components
3. **Simplified architecture**: No need to handle HTML content strings

### Migration from HTML-based Systems

If migrating from an HTML-content based blog:

1. Update blog post interface to use `component` instead of `content`
2. Replace `{@html post.content}` with `<svelte:component this={post.component} />`
3. Remove any server-side HTML rendering logic

## Deployment

The markdown blog works with any SvelteKit deployment target:

- **Static**: Pre-rendered at build time
- **Server**: Rendered on demand
- **Hybrid**: Mix of static and server rendering

All posts are processed at build time, so they work perfectly with static deployment.

## Best Practices

1. **Consistent Naming**: Use kebab-case for slugs and filenames
2. **Descriptive Excerpts**: Write compelling excerpts for better SEO
3. **Meaningful Tags**: Use consistent, meaningful tags
4. **Proper Dates**: Always use YYYY-MM-DD format for dates
5. **Image Optimization**: Optimize images before including in posts
6. **Internal Linking**: Use relative links for internal content

## Troubleshooting

### Common Issues

1. **Post not appearing**: Check `publishedAt` date is not in the future
2. **Styling issues**: Ensure prose classes are applied correctly
3. **Build errors**: Validate frontmatter YAML syntax
4. **Component not rendering**: Verify the markdown file has proper frontmatter

### Debug Mode

In development, check the browser console for any post loading errors. The system will log issues with individual posts without breaking the entire blog.

### Svelte 5 Specific Issues

- **Component rendering errors**: Check that the markdown files are properly processed by mdsvex
- **Missing syntax highlighting**: Ensure shiki is properly configured
- **Layout issues**: Verify the MDXLayout component is correctly set in svelte.config.js

---

This Svelte 5 compatible markdown blog system provides a powerful, flexible, and maintainable solution for content management while leveraging the full power of Svelte's component system!
