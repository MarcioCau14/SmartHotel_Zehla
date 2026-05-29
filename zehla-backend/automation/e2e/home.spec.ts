import { test, expect } from '@playwright/test';
import { clearAllMocks } from './helpers';

test.describe('Home Page - Landing', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllMocks(page);
  });

  test('deve carregar a landing page com elementos principais', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(
      page.getByRole('heading', { name: /Recupere os 25% de comissão/i })
    ).toBeVisible({ timeout: 20000 });

    await expect(
      page.getByRole('button', { name: /Começar Teste Grátis/i })
    ).toBeVisible();
  });

  test('deve navegar para a página de login ao clicar em Entrar', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const entrarButton = page.getByRole('button', { name: 'Entrar' });
    await expect(entrarButton.first()).toBeVisible({ timeout: 20000 });
    await entrarButton.first().click();

    await page.waitForURL('**/login', { timeout: 15000 });
    await expect(
      page.getByRole('heading', { name: /Bem-vindo de volta/i })
    ).toBeVisible({ timeout: 10000 });
  });
});
