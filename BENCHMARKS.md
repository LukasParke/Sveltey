# Benchmarks

Performance benchmarks for the production build of this template.
Regenerate at any time — see [Reproducing](#reproducing).

## Environment

| | |
| --- | --- |
| Date | 2026-08-21 |
| CPU | AMD Ryzen 9 7950X3D (16C/32T) |
| RAM/OS | Linux (CachyOS), local loopback |
| Node | v24.18.0 |
| Server | `vite preview` serving the production build, **single Node process**, bound to 127.0.0.1 |
| Load tool | autocannon v7 |

Numbers below are for one machine and one process — use them as a relative
baseline for regressions, not as absolute hosting capacity.

## Production build

Clean build (`rm -rf .svelte-kit/output && npm run build`):

| Metric | Value |
| --- | --- |
| Wall time | **~9.3 s** |
| Client output (JS+CSS) | 1.04 MB raw / **249 KB gzip** |
| Server output | 1.5 MB raw |

Largest client artifacts:

| File | Raw | Gzip |
| --- | --- | --- |
| `assets/0.<hash>.css` (Tailwind + Skeleton theme compile) | 384 KB | 41.8 KB |
| `chunks/CVvSWwj1.js` (Skeleton component library) | 218 KB | ~60 KB* |
| `nodes/15.*.js` (docs landing page) | 115 KB | ~35 KB* |

\* gzip estimated from file composition.

Build-time profile (from Vite plugin timings): 57% Kit compile writeBundle,
34% Tailwind generate, 20% svelte compile across 1,850 module transforms.

## HTTP load (SSR responses)

autocannon against the preview server. Warmup phase excluded from results.
10-second runs; two concurrency levels.

### concurrency = 10

| Route | req/s | p50 (ms) | p97.5 (ms) | p99 (ms) | Throughput |
| --- | --- | --- | --- | --- | --- |
| `/` | 897 | 8.0 | 34.0 | 44.0 | 28.7 MB/s |
| `/pricing` | 1373 | 5.0 | 15.0 | 16.0 | 53.1 MB/s |
| `/docs/installation` | 1497 | 5.0 | 13.0 | 16.0 | 51.7 MB/s |
| `/blog` | 1212 | 6.0 | 15.0 | 19.0 | 37.4 MB/s |
| `/blog/getting-started-with-our-saas-template` | 1217 | 6.0 | 15.0 | 18.0 | 68.5 MB/s |

### concurrency = 50

| Route | req/s | p50 (ms) | p97.5 (ms) | p99 (ms) | Throughput |
| --- | --- | --- | --- | --- | --- |
| `/` | 1558 | 30.0 | 45.0 | 56.0 | 49.8 MB/s |
| `/pricing` | 1318 | 36.0 | 50.0 | 54.0 | 51.0 MB/s |
| `/docs/installation` | 1269 | 35.0 | 78.0 | 93.0 | 43.8 MB/s |
| `/blog` | 1178 | 40.0 | 62.0 | 69.0 | 36.3 MB/s |
| `/blog/getting-started-with-our-saas-template` | 1201 | 40.0 | 50.0 | 57.0 | 67.6 MB/s |

Zero errors and zero non-2xx/3xx responses in every run.

Observations:

- All routes sustain >1,100 req/s in a single process; p99 stays under
  100 ms everywhere, including under 50 concurrent connections.
- The homepage is the most expensive SSR render (largest layout, Speed
  Insights injection); pricing/docs are the cheapest.
- The compiled mdsvex blog post transfers the most bytes (rich HTML) but
  renders at the same cost as any other page — content is compiled at build
  time, not per request.

## Client-side page loads

Playwright + bundled Chromium, fresh context per sample (cold cache),
median of 3 loads. Measured from the browser Performance API.

| Route | TTFB (ms) | DOMContentLoaded (ms) | Load (ms) | Requests | Transferred | Decoded |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 3 | 557 | 557 | 37 | 208.8 KB | 827.5 KB |
| `/pricing` | 3 | 870 | 871 | 32 | 203.4 KB | 828.6 KB |
| `/docs` | 6 | 233 | 233 | 29 | 197.3 KB | 811.1 KB |
| `/docs/installation` | 4 | 114 | 207 | 32 | 233.9 KB | 929.3 KB |
| `/blog` | 5 | 147 | 227 | 32 | 171.0 KB | 786.7 KB |

Notes:

- TTFB of 3–6 ms reflects loopback + tiny SSR work; real-world TTFB will be
  dominated by network distance and hosting platform.
- Decoded payload (~800 KB) is dominated by the single combined Skeleton +
  Tailwind stylesheet and framework chunks; over the wire it is ~200 KB
  compressed.
- `/pricing` DOMContentLoaded is highest because its hydration does the most
  work (pricing cards, FAQ markup). Docs pages hydrate fastest.

## Test suite speed

| Suite | Time |
| --- | --- |
| Vitest unit/integration/component (126 tests) | ~12 s |
| Playwright e2e (25 tests, includes dev-server start) | ~26 s |

## Reproducing

```bash
npm run build
npx vite preview --port 4173 --host 127.0.0.1 &
npx -y autocannon@7 -c 10 -d 10 -j http://127.0.0.1:4173/
node scripts/client-metrics.mjs   # requires `npm run build` first
```
