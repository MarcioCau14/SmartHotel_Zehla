import { test, expect } from '@playwright/test';
import { clearAllMocks } from './helpers';

test.describe('Trial / Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllMocks(page);
  });

  test('deve carregar a página de teste grátis com o wizard', async ({ page }) => {
    await page.goto('/teste-gratis', { waitUntil: 'domcontentloaded' });

    await expect(
      page.getByRole('heading', { name: /Iniciar Teste Grátis/i })
    ).toBeVisible({ timeout: 15000 });

    // Campos do primeiro passo (StepWelcome)
    await expect(page.getByPlaceholder('Seu nome completo')).toBeVisible();
    await expect(page.getByPlaceholder('seu@email.com')).toBeVisible();
  });

  test('deve permitir navegar para o login a partir do trial', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    await expect(
      page.getByRole('heading', { name: /Bem-vindo de volta/i })
    ).toBeVisible();
  });
});
