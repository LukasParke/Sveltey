import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	// Component tests run in jsdom; Svelte must resolve its browser build.
	resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
	test: {
		environment: 'jsdom',
		setupFiles: ['./src/tests/setup.ts'],
		env: { STRIPE_PRICE_PRO: 'price_test_1' },
		include: ['src/tests/**/*.test.ts', 'src/tests/**/*.test.svelte.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
			reportsDirectory: 'coverage',
			// hooks.server.ts is excluded: its route-rule decision logic lives in
			// evaluateRouteRules (tested via $lib/auth helpers import path) and its
			// redirect/cookie glue requires Kit request internals that only exist
			// during live requests — covered by the Playwright e2e suite instead.
			// Route page components (.svelte) are likewise covered by e2e.
			include: ['src/lib/**', 'src/routes/**/*.server.ts', 'src/routes/api/**/*.ts'],
			exclude: [
				'src/lib/docs/*.md',
				'src/lib/posts/*.md',
				'src/lib/components/MDSvex/**',
				'src/lib/assets/**',
				'src/tests/**'
			],
			thresholds: {
				lines: 95,
				statements: 95,
				functions: 95,
				// Remaining uncovered branches are Svelte markup conditionals
				// exercised by the Playwright e2e suite rather than unit tests.
				branches: 85
			}
		}
	}
});
