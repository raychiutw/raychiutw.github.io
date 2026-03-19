import { test, expect } from '@playwright/test';

test.describe('首頁', () => {
  test('應該成功載入首頁', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('應該顯示文章列表', async ({ page }) => {
    await page.goto('/');
    // PostCard 使用 <article> 標籤
    const articles = page.locator('article');
    await expect(articles.first()).toBeVisible();
    const count = await articles.count();
    expect(count).toBeGreaterThan(0);
  });

  test('應該顯示導覽列', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav[aria-label="主要導覽"]');
    await expect(nav).toBeAttached();
  });

  test('應該顯示網站標題', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText("Ray's Notes");
  });
});
