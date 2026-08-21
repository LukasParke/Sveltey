import adapter from '@sveltejs/adapter-auto';
import { mdsvex } from 'mdsvex';
import remarkUnwrapImages from 'remark-unwrap-images';
import remarkToc from 'remark-toc';
import remarkAbbr from 'remark-abbr';
import rehypeSlug from 'rehype-slug';

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	extensions: ['.md'],
	remarkPlugins: [remarkUnwrapImages, remarkToc, remarkAbbr],
	rehypePlugins: [rehypeSlug],
	highlight: { theme: 'one-dark-pro' }
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	extensions: ['.svelte', '.md'],
	preprocess: [mdsvex(mdsvexOptions)],

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter()
	}
};

export default config;
