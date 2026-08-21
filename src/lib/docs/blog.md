---
title: Blog
description: Markdown blog with frontmatter metadata, featured posts, tags, and live components.
section: content
---

<script>
    import Callout from '$lib/components/docs/Callout.svelte';
</script>

## Writing a post

Drop a `.md` file into `src/lib/posts/`. Frontmatter drives everything:

```md
---
title: My Launch Announcement
excerpt: One sentence shown on cards and in meta descriptions.
publishedAt: 2026-01-15
author: Your Name
tags: [product, launch]
featured: true
slug: my-launch-announcement
---

Your markdown content here.
```

- `slug` is optional — it defaults to the filename
- `featured: true` surfaces the post in the Featured section of `/blog`
- Posts with `publishedAt` in the future are hidden automatically (schedule by date)
- `tags` power tag chips on listing and detail pages

## Components inside posts

Posts compile through mdsvex, so Svelte components work exactly like in the
docs — import them in a script block and use them inline. The template ships
demo components in `src/lib/components/MDSvex/` (`Count`, `Boinger`,
`Seriously`) showing the pattern.

## Rendering pipeline

- Listing: `getAllPosts()` reads only frontmatter from every post (cheap)
- Detail: `getPostBySlug()` loads one compiled component, gated by publish date
- `rehype-slug` adds heading anchors; syntax highlighting comes from mdsvex's
  shiki integration configured in `svelte.config.js`

## SEO

Each post emits page-specific meta via its load function: title, description,
canonical URL, OpenGraph `article` type with published time and author.

<Callout kind="info" title="Docs vs blog">
    Both run on the same mdsvex engine. The docs add a config registry, TOC
    extraction, and pagination — see
    <a href="/docs/writing-docs">Writing Docs</a>.
</Callout>
