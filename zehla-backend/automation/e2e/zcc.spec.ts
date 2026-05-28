import { test, expect } from '@playwright/test';
import { clearAllMocks } from './helpers';

test.describe('ZCC - ZEHLA Control Center', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllMocks(page);
  });

  test('deve carregar a página de login do ZCC com campos e botão', async ({ page }) => {
    await page.goto('/zcc-login', { waitUntil: 'domcontentloaded' });

    await expect(
      page.getByRole('heading', { name: /Acesso Administrativo/i })
    ).toBeVisible();

    await expect(page.getByPlaceholder('admin@smarthotel.com')).toBeVisible();
    await expect(page.getByPlaceholder('Senha administrativa')).toBeVisible();

    await expect(
      page.getByRole('button', { name: /Acessar ZEHLA Control Center/i })
    ).toBeVisible();
  });

  test('deve fazer login no ZCC e acessar o painel', async ({ page }) => {
    await page.goto('/zcc-login', { waitUntil: 'domcontentloaded' });

    // Preencher credenciais padrão do admin
    await page.getByPlaceholder('admin@smarthotel.com').fill('admin@smarthotel.com');
    await page.getByPlaceholder('Senha administrativa').fill('zehla2026');

    // Clicar no botão de acesso (o login usa window.location.href)
    await page.getByRole('button', { name: /Acessar ZEHLA Control Center/i }).click();

    // Aguardar navegação para /zcc (hard navigation via location.href)
    await page.waitForFunction(() => window.location.pathname === '/zcc', { timeout: 30000 });

    // Verificar que o ZCC carregou (esperar pela renderização)
    await page.waitForLoadState('domcontentloaded');
  });
});
