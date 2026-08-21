---
title: UI Components
description: Reusable primitives shipped with the template — toasts, callouts, brand icons, and the docs kit.
section: reference
---

## Toaster

Skeleton v5 removed the high-level toaster API, so the template ships a small
runes-based one with identical ergonomics:

```ts
import { toaster } from '$lib';

toaster.create({
	type: 'success', // 'success' | 'error' | 'warning' | 'info'
	title: 'Saved',
	description: 'Optional longer text.'
});
```

- Renders through `<Toaster />` in the root layout (fixed, top-right)
- Auto-dismisses after 5s (per-toast `duration` override), max 4 visible
- Dismiss button + `aria-live="polite"` out of the box

## Docs kit (`src/lib/components/docs/`)

| Component                | Purpose                                                         |
| ------------------------ | --------------------------------------------------------------- |
| `Callout.svelte`         | `kind="info/success/warning/danger"` admonition blocks          |
| `DocsSidebar.svelte`     | Registry-driven section nav (used in sidebar and mobile drawer) |
| `TableOfContents.svelte` | "On this page" rail with IntersectionObserver highlighting      |

These are intentionally generic — products can reuse them for their own docs.

## Brand icons (`src/lib/components/icons/`)

Lucide 1.x dropped brand marks, so GitHub, Google, X, and LinkedIn are
first-party SVG components accepting a `class` prop:

```svelte
import GitHubIcon from '$lib/components/icons/GitHubIcon.svelte';
<GitHubIcon class="size-4" />
```

All use `fill="currentColor"`, so they inherit text color automatically.

## Skeleton utilities

Everything else comes from Skeleton v5's token system — `btn`, `card`,
`input`, `badge`, `preset-filled-*`, `preset-outlined-*`, typography classes
(`h1`…`h4`, `anchor`). Because presets read theme custom properties, they
restyle automatically under every theme. See
[Theming](/docs/theming) for the token model.
