import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'tests',
	timeout: 30000,
	expect: {
		timeout: 5000,
	},
	use: {
		baseURL: 'http://127.0.0.1:8000',
		headless: true,
		viewport: { width: 1280, height: 720 },
		actionTimeout: 10000,
		trace: 'on-first-retry',
	},
});
