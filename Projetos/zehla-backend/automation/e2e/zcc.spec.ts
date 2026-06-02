import { test, expect } from '@playwright/test';
import { seedAuthenticatedSession, clearAllMocks } from './helpers';

test.describe('ZCC - ZEHLA Control Center', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllMocks(page);
  });

  test('deve redirecionar para /login quando nao autenticado', async ({ page }) => {
    await page.goto('/zcc', { waitUntil: 'domcontentloaded' });

    await page.waitForURL('**/login', { timeout: 15000 });
    await expect(
      page.getByRole('heading', { name: /Bem-vindo de volta/i }),
    ).toBeVisible({ timeout: 10000 });
  });

  test('deve exibir sidebar e dashboard quando autenticado', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await seedAuthenticatedSession(page);

    await page.goto('/zcc', { waitUntil: 'domcontentloaded' });

    await expect(
      page.getByText('ZCC'),
    ).toBeVisible({ timeout: 15000 });

    await expect(
      page.getByRole('link', { name: /Dashboard/i }),
    ).toBeVisible();

    await expect(
      page.getByRole('link', { name: /Leads/i }),
    ).toBeVisible();

    await expect(
      page.getByRole('link', { name: /Operacional/i }),
    ).toBeVisible();
  });
});
