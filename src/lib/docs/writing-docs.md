---
title: Writing Docs (MDX)
description: How this documentation site works, and how products can reuse the whole engine.
section: content
---

<script>
    import Counter from '$lib/components/MDSvex/Count.svelte';
</script>

## MDX-style authoring

Documentation pages are `.md` files in `src/lib/docs/`, compiled by **mdsvex** —
Svelte's MDX equivalent. That means markdown plus live Svelte components:

<Counter />

The counter above is a real Svelte component rendered inside this markdown
file. Import components at the top of any doc page:

```md
<script>
	import Callout from '$lib/components/docs/Callout.svelte';
</script>

<Callout kind="warning" title="Careful">Markdown **still works** inside.</Callout>
```

## Page anatomy

Each file carries frontmatter that the registry reads:

```md
---
title: Installation
description: One-line summary shown in headers and meta tags.
section: getting-started
---
```

- `section` must match a section id in `src/lib/config/docs.ts`
- `title` is overridden by the registry entry (keep both aligned)
- `h2`/`h3` headings become the right-hand "On this page" rail automatically

## Navigation is config-driven

`src/lib/config/docs.ts` defines sections and page order — it drives the
sidebar, landing cards, breadcrumbs, and previous/next pagination. The loader
warns if a markdown file is missing from the registry or vice versa.

## Reusing the engine for your product

Products built on this template get docs infrastructure for free:

1. Edit `config/docs.ts` — your sections, your pages
2. Write `.md` files in `src/lib/docs/`
3. Ship `/docs` as your product's documentation site

The TOC extractor (`extractHeadings`) and slugger are exported from
`$lib/docs/engine.ts`, so you can build additional views (search indexes,
printable single-page docs) over the same sources.

<Callout kind="info" title="Why mdsvex and not literal MDX?">
    mdsvex provides the exact MDX capability set — markdown with embedded
    components — natively in SvelteKit, with no React runtime. Same authoring
    model, better fit for this stack.
</Callout>
