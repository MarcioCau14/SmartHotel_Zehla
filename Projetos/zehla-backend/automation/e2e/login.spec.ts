import { test, expect } from '@playwright/test';
import { mockLoginApi, clearAllMocks } from './helpers';

test.describe('Autenticação - Login', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllMocks(page);
  });

  test('deve exibir formulario com campos email e senha', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    await expect(
      page.getByRole('heading', { name: /Bem-vindo de volta/i }),
    ).toBeVisible({ timeout: 15000 });

    await expect(page.getByPlaceholder('seu@email.com')).toBeVisible();
    await expect(page.getByPlaceholder('Sua senha')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Entrar no ZEHLA/i }),
    ).toBeVisible();
  });

  test('deve mostrar erro para credenciais invalidas', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await mockLoginApi(page);

    // Type credentials slowly to ensure React state updates
    await page.getByPlaceholder('seu@email.com').click();
    await page.getByPlaceholder('seu@email.com').pressSequentially('wrong@email.com', { delay: 10 });
    await page.getByPlaceholder('Sua senha').click();
    await page.getByPlaceholder('Sua senha').pressSequentially('wrong', { delay: 10 });

    // Submit via keyboard to bypass any click issues
    await page.keyboard.press('Enter');

    await expect(
      page.getByText('Credenciais inválidas'),
    ).toBeVisible({ timeout: 8000 });
  });

  test('deve redirecionar para /zcc com credenciais validas', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await mockLoginApi(page);

    await page.getByPlaceholder('seu@email.com').click();
    await page.getByPlaceholder('seu@email.com').pressSequentially('admin@ze.com', { delay: 10 });
    await page.getByPlaceholder('Sua senha').click();
    await page.getByPlaceholder('Sua senha').pressSequentially('123456', { delay: 10 });

    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/zcc/, { timeout: 15000 });
  });
});
