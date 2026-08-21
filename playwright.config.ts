// playwright.config.ts
import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run dev',
		port: 5173, // Default SvelteKit port
		reuseExistingServer: !process.env.CI
	},
	testDir: 'tests',
	use: {
		baseURL: 'http://localhost:5173'
	}
	// projetos: [ // Example for multiple browsers, can be simplified
	//  { name: 'chromium', use: { browserName: 'chromium' } },
	// ],
};

export default config;
