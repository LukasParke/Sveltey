---
title: Theming & Dark Mode
description: 24 Skeleton v5 themes, flash-free dark mode, and how to add your own brand theme.
section: theming
---

<script>
    import Callout from '$lib/components/docs/Callout.svelte';
</script>

## How theming works

Skeleton v5 themes are CSS custom-property sets scoped to a `data-theme`
attribute. Every theme file in the package exports rules like:

```css
[data-theme='dracula'] {
	--color-primary-500: oklch(74.03% 0.15 302.13deg);
	/* …full palette + typography + radius tokens */
}
```

The app sets `data-theme` on `<body>`, so tokens cascade to everything inside
it. All Skeleton utility classes (`preset-filled-primary-500`, `btn`, `card`,
…) read these tokens, which is why one attribute restyles the entire app.

## What ships

All **24 themes** are imported once in `src/app.css` and registered in
`src/lib/components/ThemeSwitch.svelte`:

catppuccin, cerberus, concord, crimson, dracula, fennec, hamlindigo, legacy,
mint, modern, mona, nosh, nouveau, pine, reign, rocket, rose, rosepine,
sahara, seafoam, terminus, vintage, vox, wintry.

The header's palette button opens the switcher; the choice persists to
`localStorage.colorTheme` and applies instantly.

## Flash-free dark mode

`src/app.html` contains a tiny inline script that runs **before hydration**:

```js
const colorTheme = localStorage.getItem('colorTheme') || 'legacy';
const darkMode = storedDarkMode === null ? true : storedDarkMode !== 'false';
document.documentElement.classList.toggle('dark', darkMode);
document.body.setAttribute('data-theme', colorTheme);
```

Users see their saved theme on first paint — no dark flash for light-mode
users, no wrong theme flash at all. `ThemeSwitch.svelte` then takes over after
hydration. A dedicated e2e test asserts zero bootstrap errors and correct
`data-theme`.

<Callout kind="warning" title="Keep the two lists in sync">
    When adding a theme, import it in <code>app.css</code> and add it to
    <code>colorThemes</code> in <code>ThemeSwitch.svelte</code> — the file has
    a comment marking the sync point.
</Callout>

## Adding a brand theme

1. Copy any theme file from `node_modules/@skeletonlabs/skeleton/src/themes/`
2. Adjust its custom properties to your brand palette
3. Save it as `src/lib/themes/your-brand.css` and import it in `app.css`
4. Register `{ value: 'your-brand', label: 'Your Brand' }` in ThemeSwitch

Because themes are pure custom properties, your product's palette propagates
to every preset, button, and surface without touching component code.
