import { test, expect } from '@playwright/test';
import { mockOnboardingApi, clearAllMocks } from './helpers';

test.describe('Onboarding Wizard - Teste Gratis', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllMocks(page);
  });

  test('deve carregar o wizard com stepper e passo 1', async ({ page }) => {
    await page.goto('/teste-gratis', { waitUntil: 'domcontentloaded' });

    await expect(
      page.getByText('Dados Pessoais'),
    ).toBeVisible({ timeout: 15000 });

    await expect(page.getByPlaceholder('Seu nome completo')).toBeVisible();
    await expect(page.getByPlaceholder('seu@email.com')).toBeVisible();
    await expect(page.getByPlaceholder('(11) 99999-9999')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Próximo/i }),
    ).toBeVisible();
  });

  test('deve avancar do passo 1 para o passo 2 apos preencher dados pessoais', async ({ page }) => {
    await page.goto('/teste-gratis', { waitUntil: 'domcontentloaded' });

    await page.getByPlaceholder('Seu nome completo').fill('Maria Silva');
    await page.getByPlaceholder('seu@email.com').fill('maria@pousada.com');
    await page.getByPlaceholder('(11) 99999-9999').fill('11999999999');

    await page.getByRole('button', { name: /Próximo/i }).click();

    await expect(
      page.getByText('NOME DA POUSADA'),
    ).toBeVisible({ timeout: 10000 });
  });

  test('deve submeter o wizard completo e capturar o lead via API', async ({ page }) => {
    await mockOnboardingApi(page);

    await page.goto('/teste-gratis', { waitUntil: 'domcontentloaded' });

    // Step 1 → fill personal data
    await page.getByPlaceholder('Seu nome completo').fill('Maria Silva');
    await page.getByPlaceholder('seu@email.com').fill('maria@pousada.com');
    await page.getByPlaceholder('(11) 99999-9999').fill('11999999999');
    await page.getByRole('button', { name: /Próximo/i }).click();

    await expect(page.getByText('NOME DA POUSADA')).toBeVisible({ timeout: 10000 });

    // Step 2 → fill property data
    await page.getByPlaceholder('Pousada do Sol').fill('Pousada do Sol');
    await page.getByPlaceholder('São Paulo').fill('São Paulo');
    await page.getByPlaceholder('SP').fill('SP');
    await page.locator('select').selectOption('pousada');
    await page.getByPlaceholder('10').fill('10');

    await page.getByRole('button', { name: /Próximo/i }).click();

    await expect(page.getByText('Confirme os dados')).toBeVisible({ timeout: 10000 });

    // Step 3 → submit
    await page.getByRole('button', { name: /Ativar meu ZEHLA/i }).click();

    await expect(page).toHaveURL(/\/zcc/, { timeout: 15000 });
  });
});
