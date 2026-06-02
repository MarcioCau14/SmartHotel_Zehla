import { test, expect } from '@playwright/test';
import { clearAllMocks } from './helpers';

test.describe('Home Page - Landing', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllMocks(page);
  });

  test('deve carregar a landing com titulo principal e CTA', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(
      page.getByRole('heading', { name: /O Cérebro Cognitivo da Sua Pousada/i }),
    ).toBeVisible({ timeout: 15000 });

    await expect(
      page.getByRole('button', { name: /Testar Grátis por 7 Dias/i }),
    ).toBeVisible();
  });

  test('deve navegar para /teste-gratis ao clicar no CTA', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: /Testar Grátis por 7 Dias/i }).click();

    await expect(page).toHaveURL(/\/teste-gratis/, { timeout: 15000 });
  });
});
