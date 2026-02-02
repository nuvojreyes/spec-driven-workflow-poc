import { test, expect } from '@playwright/test';

test('backend /api/ returns hello', async ({ request }) => {
	const response = await request.get('/api/');
	expect(response.ok()).toBeTruthy();
	const body = await response.json();
	expect(body.message).toBe('Hello from Django backend');
});
