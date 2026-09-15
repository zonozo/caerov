import { expect, test } from '@playwright/test';

test('shows the home workspace', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '欢迎回来，林默' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Caerov 首页' })).toBeVisible();
});
