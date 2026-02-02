# QA (Playwright)

Minimal Playwright scaffold for end-to-end testing.

Setup:

```bash
cd qa
npm install
npx playwright install
npm test
```

Notes:

- Tests assume the backend is running at `http://127.0.0.1:8000` (see `playwright.config.ts`).
- The example test checks `/api/` for the JSON greeting from the Django backend.
