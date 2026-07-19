import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('#/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('new simulation landing links into the complete application', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173/');
  await expect(page.getByRole('heading', { name: 'I Create My Own Wealth' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Open Full Vision 2031/i })).toHaveAttribute(
    'href',
    './app.html#/',
  );
  await page.getByRole('link', { name: /15-Quarter Map/i }).click();
  await expect(page).toHaveURL(/app\.html#\/timeline/);
  await expect(page.locator('main h1')).toBeVisible();
});

test('memory persists locally and secure cloud backup is available', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173/');
  await page.evaluate(() => {
    localStorage.setItem(
      'visionlife',
      JSON.stringify({
        day: 7,
        points: 125,
        ventures: [{ name: 'Persistent Test Venture', desc: 'Saved locally' }],
      }),
    );
    localStorage.setItem('supa_url', 'https://unsafe.example');
    localStorage.setItem('supa_key', 'legacy-key');
  });
  await page.reload();

  const remembered = await page.evaluate(() => JSON.parse(localStorage.getItem('visionlife') || '{}'));
  expect(remembered.day).toBe(7);
  expect(remembered.ventures[0].name).toBe('Persistent Test Venture');
  expect(await page.evaluate(() => localStorage.getItem('supa_url'))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('supa_key'))).toBeNull();

  const cloudButton = page.locator('[data-cloud-open]');
  await expect(cloudButton).toBeVisible();
  await cloudButton.click();
  await expect(page.getByRole('heading', { name: /Keep your progress across devices/i })).toBeVisible();
  await expect(page.getByLabel('Email address')).toBeVisible();
});

test('onboarding, prologue, rewind and daily persistence', async ({ page }) => {
  await page.getByRole('button', { name: /begin the journey/i }).click();
  await page.getByLabel('Preferred display name').fill('Lawrence');
  await page.getByRole('button', { name: /wake up/i }).click();
  await expect(
    page.getByRole('heading', { name: /Vision Day:/ }),
  ).toBeVisible();
  for (let i = 0; i < 10; i++)
    await page.getByRole('button', { name: /continue/i }).click();
  await page.getByRole('button', { name: /rewind the life/i }).click();
  for (let i = 0; i < 15; i++)
    await page.getByRole('button', { name: /reveal quarter/i }).click();
  await page.getByRole('button', { name: /unlock fall/i }).click();
  await page.locator('.choice-grid button').first().click();
  await page.locator('.quiz-option').first().click();
  await page
    .getByLabel(/Evidence or completion note/)
    .fill('Created one clear artifact.');
  await page.getByRole('button', { name: /complete chapter/i }).click();
  await page.reload();
  await expect(
    page.getByRole('button', { name: /chapter complete/i }),
  ).toBeVisible();
});

test('wealth lab, settings, export and accessibility smoke', async ({ page }) => {
  await page.goto('#/wealth-lab');
  await expect(page.getByRole('heading', { name: 'Wealth Lab' })).toBeVisible();
  await page.getByLabel('Operating cash').fill('600000');
  await expect(page.getByText('$20,100,000')).toBeVisible();
  const a11y = await new AxeBuilder({ page }).analyze();
  expect(a11y.violations.filter((v) => v.impact === 'critical')).toEqual([]);
  await page.goto('#/settings');
  await page.getByLabel(/Larger interface text/).check();
  await page.getByRole('button', { name: 'Save settings' }).click();
  const dl = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export all JSON/ }).click();
  await dl;
});

test('all major routes survive the Pages base path', async ({ page }) => {
  for (const route of [
    'timeline',
    'academy',
    'wealth-lab',
    'projects',
    'journal',
    'progress',
    'legacy-laws',
    'course-builder',
    'sources',
    'settings',
  ]) {
    await page.goto(`#/${route}`);
    await expect(page.locator('main h1')).toBeVisible();
  }
});
