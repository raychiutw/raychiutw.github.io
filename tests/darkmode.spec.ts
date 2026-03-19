import { test, expect } from '@playwright/test';

test.describe('深色模式', () => {
  test('應該存在深色模式切換按鈕', async ({ page }) => {
    await page.goto('/');
    const toggleButton = page.locator('button[aria-label*="切換"]');
    await expect(toggleButton.first()).toBeVisible();
  });
});
