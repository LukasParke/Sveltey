import { expect, test } from '@playwright/test';

const publicPages = ['/', '/pricing', '/blog', '/contact', '/terms', '/privacy'];

test.describe('public pages', () => {
	for (const path of publicPages) {
		test(`renders ${path}`, async ({ page }) => {
			const response = await page.goto(path);
			expect(response?.status()).toBe(200);
			await expect(page).toHaveTitle(/Sveltey/);
		});
	}
});

test.describe('navigation integrity', () => {
	test('homepage CTAs point at real routes', async ({ page }) => {
		await page.goto('/');
		const authLinks = await page.$$eval('a[href^="/auth"]', (as) =>
			as.map((a) => a.getAttribute('href'))
		);
		for (const href of authLinks) {
			expect(['/auth/login', '/auth/register']).toContain(href);
		}
		expect(authLinks).not.toContain('/auth/signup');
	});

	test('footer links resolve', async ({ page }) => {
		await page.goto('/');
		const internal = await page.$$eval('footer a[href^="/"]', (as) =>
			as.map((a) => a.getAttribute('href') as string)
		);
		expect(internal.length).toBeGreaterThan(3);
		for (const href of internal) {
			const res = await page.request.get(href);
			expect(res.status(), `footer link ${href}`).toBe(200);
		}
	});

	test('unknown route renders the error page', async ({ page }) => {
		await page.goto('/this-route-does-not-exist');
		await expect(page.locator('h1')).toContainText('404');
	});
});

test.describe('auth guard', () => {
	test('dashboard redirects anonymous users to login', async ({ page }) => {
		await page.goto('/app/dashboard');
		await expect(page).toHaveURL(/\/auth\/login/);
		await expect(page.locator('h1')).toBeVisible();
	});

	test('login page offers email/password and OAuth', async ({ page }) => {
		await page.goto('/auth/login');
		await expect(page.locator('input#email')).toBeEnabled();
		await expect(page.locator('input#password')).toBeEnabled();
		await expect(page.getByRole('button', { name: /GitHub/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /Google/i })).toBeDisabled();
	});

	test('register page links back to login and reset exists', async ({ page }) => {
		await page.goto('/auth/register');
		await expect(page.getByRole('link', { name: /sign in here/i })).toBeVisible();
		const reset = await page.request.get('/auth/reset');
		expect(reset.status()).toBe(200);
	});
});

test.describe('pricing', () => {
	test('shows setup banner and disabled checkout when Stripe is unconfigured', async ({ page }) => {
		await page.goto('/pricing');
		await expect(page.getByText(/Payments not configured/i)).toBeVisible();
		const disabledButtons = await page.$$eval('button[disabled]', (bs) =>
			bs.map((b) => b.textContent?.trim() ?? '').filter((t) => t.length > 0)
		);
		expect(disabledButtons.join(' ')).toMatch(/Checkout Unavailable|Your Current Plan/);
	});

	test('lists all three plans with prices', async ({ page }) => {
		await page.goto('/pricing');
		for (const plan of ['Starter', 'Pro', 'Enterprise']) {
			await expect(page.getByRole('heading', { name: plan, exact: true })).toBeVisible();
		}
	});
});

test.describe('contact form', () => {
	test('has a hidden honeypot and enabled fields', async ({ page }) => {
		await page.goto('/contact');
		const honeypot = page.locator('#website');
		await expect(honeypot).toBeHidden();
		await expect(page.locator('input[name=name]')).toBeEnabled();
		await expect(page.locator('button[type=submit]')).toBeEnabled();
	});

	test('submits and shows honest dev-mode feedback', async ({ page }) => {
		await page.goto('/contact');
		const errors: string[] = [];
		page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`));
		page.on('console', (m) => {
			if (m.type() === 'error') errors.push(`CONSOLE: ${m.text().slice(0, 200)}`);
		});
		await page.fill('input[name=name]', 'E2E Bot');
		await page.fill('input[name=email]', 'e2e@example.com');
		await page.fill('input[name=subject]', 'Automated check');
		await page.fill('textarea[name=message]', 'Sent by the smoke test suite.');
		await page.click('button[type=submit]');
		await page.waitForTimeout(4000);
		const toasts = await page.evaluate(() =>
			[...document.querySelectorAll('[data-toast-type]')].map((t) => t.textContent?.slice(0, 60))
		);
		console.log(`[diag] toasts=${JSON.stringify(toasts)} errors=${JSON.stringify(errors)}`);
		await page.click('button[type=submit]');
		await expect(page.getByText(/Message received/i)).toBeVisible({ timeout: 15_000 });
		await expect(page.locator('#website')).toBeHidden(); // honeypot never surfaced to humans
	});

	test('rejects bot submissions that fill the honeypot silently', async ({ page }) => {
		await page.goto('/contact');
		await page.fill('input[name=name]', 'Bot');
		await page.fill('input[name=email]', 'bot@example.com');
		await page.fill('input[name=subject]', 'Spam');
		await page.fill('textarea[name=message]', 'Buy now');
		await page.$eval('#website', (el) => {
			(el as HTMLInputElement).value = 'http://spam.example';
			el.dispatchEvent(new Event('input', { bubbles: true }));
		});
		await page.click('button[type=submit]');
		// Honeypot hits pretend success without any dev-mode notice.
		await expect(page.getByText(/Message received/i)).toBeHidden();
	});
});

test.describe('theme handling', () => {
	test('bootstrap script applies stored theme without errors', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (e) => errors.push(String(e)));
		await page.addInitScript(() => {
			localStorage.setItem('colorTheme', 'dracula');
			localStorage.setItem('darkMode', 'true');
		});
		await page.goto('/pricing');
		// Uncaught ReferenceErrors in the inline bootstrap must fail this test.
		expect(errors).toEqual([]);
		await expect(page.locator('body')).toHaveAttribute('data-theme', 'dracula');
	});

	test('restores light mode without a dark flash', async ({ page }) => {
		await page.addInitScript(() => {
			localStorage.setItem('darkMode', 'false');
			localStorage.setItem('colorTheme', 'rose');
		});
		await page.goto('/pricing');
		await expect(page.locator('html')).not.toHaveClass(/dark/, { timeout: 10_000 });
		await expect(page.locator('body')).toHaveAttribute('data-theme', 'rose');
	});

	test('defaults to dark mode for new visitors', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('html')).toHaveClass(/dark/, { timeout: 10_000 });
	});
});

test.describe('blog', () => {
	test('listing links to posts and posts render', async ({ page }) => {
		await page.goto('/blog');
		const firstPost = page.locator('a[href^="/blog/"]').first();
		await firstPost.click();
		await expect(page.locator('article')).toBeVisible();
	});
});
