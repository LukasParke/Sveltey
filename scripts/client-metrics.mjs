// Client-side benchmark: cold-context page loads via Playwright/Chromium.
// Measures TTFB, DOMContentLoaded, Load, request counts and transfer sizes
// from the browser's own Performance API. Usage: node scripts/client-metrics.mjs
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4173';
const ROUTES = ['/', '/pricing', '/docs', '/docs/installation', '/blog'];
const SAMPLES = 3;

const browser = await chromium.launch();
const results = {};

for (const route of ROUTES) {
	const samples = [];
	for (let i = 0; i < SAMPLES; i++) {
		const context = await browser.newContext();
		const page = await context.newPage();
		await page.goto(BASE + route, { waitUntil: 'load' });
		await page.waitForTimeout(250); // let deferred resources settle

		const nav = await page.evaluate(() => {
			const n = performance.getEntriesByType('navigation')[0];
			const res = performance.getEntriesByType('resource');
			return {
				ttfbMs: Math.round(n.responseStart),
				domContentLoadedMs: Math.round(n.domContentLoadedEventEnd),
				loadMs: Math.round(n.loadEventEnd || n.domContentLoadedEventEnd),
				requests: res.length + 1,
				transferBytes: Math.round(
					res.reduce((sum, r) => sum + (r.transferSize || 0), 0) + n.transferSize
				),
				decodedBytes: Math.round(
					res.reduce((sum, r) => sum + (r.decodedBodySize || 0), 0) + n.decodedBodySize
				)
			};
		});
		samples.push(nav);
		await context.close();
	}

	const median = (arr) => arr.sort((a, b) => a - b)[Math.floor(arr.length / 2)];
	results[route] = {
		ttfbMs: median(samples.map((s) => s.ttfbMs)),
		domContentLoadedMs: median(samples.map((s) => s.domContentLoadedMs)),
		loadMs: median(samples.map((s) => s.loadMs)),
		requests: median(samples.map((s) => s.requests)),
		transferKb: +(median(samples.map((s) => s.transferBytes)) / 1024).toFixed(1),
		decodedKb: +(median(samples.map((s) => s.decodedBytes)) / 1024).toFixed(1)
	};
	console.log(route, JSON.stringify(results[route]));
}

await browser.close();
await import('node:fs').then((fs) =>
	fs.writeFileSync('/tmp/bench/client-metrics.json', JSON.stringify(results, null, '\t'))
);
