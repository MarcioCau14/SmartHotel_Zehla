import { test, expect } from '@playwright/test';
import { mockLoginApi, mockSessionApi, clearAllMocks } from './helpers';

test.describe('Autenticação - Login', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllMocks(page);
  });

  test('deve exibir o formulário de login com campos e botão', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });

    // Título
    await expect(
      page.getByRole('heading', { name: /Bem-vindo de volta/i })
    ).toBeVisible();

    // Campos do formulário
    await expect(page.getByPlaceholder('seu@email.com')).toBeVisible();
    await expect(page.getByPlaceholder('Sua senha')).toBeVisible();

    // Botão de submit
    await expect(
      page.getByRole('button', { name: /Entrar/i })
    ).toBeVisible();
  });

  test('deve logar com credenciais válidas e redirecionar ao dashboard', async ({ page }) => {
    await mockLoginApi(page);
    await mockSessionApi(page);

    await page.goto('/login', { waitUntil: 'networkidle' });

    // Preencher credenciais mockadas
    const emailInput = page.getByPlaceholder('seu@email.com');
    await emailInput.fill('maria@pousadadosol.com.br');

    const senhaInput = page.getByPlaceholder('Sua senha');
    await senhaInput.fill('pousada123');

    // Clicar em Entrar
    await page.getByRole('button', { name: /Entrar/i }).click();

    // Deve redirecionar ao dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
