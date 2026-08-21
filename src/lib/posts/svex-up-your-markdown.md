---
title: 'Svex up your markdown'
slug: 'svex-up-your-markdown'
excerpt: 'Markdown is pretty good but sometimes you just need more.'
publishedAt: '2025-05-27'
author: 'Luke Hagar'
color: cadetblue
list: [1, 2, 3, 4, 'boo']
tags: ['mdsvex', 'ftw', 'rofl']
---

<script>
	import Boinger from '$lib/components/MDSvex/Boinger.svelte';
	import Section from '$lib/components/MDSvex/Section.md';
	import Count from '$lib/components/MDSvex/Count.svelte';
  import Seriously from '$lib/components/MDSvex/Seriously.svelte';

	let number = $state(45);
</script>

# { title }

This is an example of a post written in markdown.
and loaded via MDSvex.

[MDSvex](https://mdsvex.pngwn.io) is a Svelte project that allows you to write markdown files and have them compiled into Svelte components.

## Good stuff in your markdown

Markdown is pretty good but sometimes you just need more.

Sometimes you need a boinger like this:

<Boinger color="{ color }"/>

Not many people have a boinger right in their markdown.

## Markdown in your markdown

Sometimes what you wrote last week is so good that you just _have_ to include it again.

I'm not gonna stand in the way of your egomania.

> <Section />
> <Count />
>
> — _Me, May 2019_

Yeah, thats right you can put wigdets in markdown (`.svx` files or otherwise). You can put markdown in widgets too.

<Seriously>

### I wasn't joking

```
	This is real life
```

</Seriously>

Sometimes you need your widgets **inlined** (like this:<Count count="{number}"/>) because why shouldn't you.
Obviously you have access to values defined in YAML (namespaced under `metadata`) and anything defined in an fenced `js exec` block can be referenced directly.

Normal markdown stuff works too:

| like  | this |
| ----- | ---- |
| table | here |

And _this_ and **THIS**. And other stuff. You can also use all your favorite Svelte features, like `each` blocks:

<ul>
{#each list as item}
  <li>{item}</li>
{/each}
</ul>

and all the other good Svelte stuff.
