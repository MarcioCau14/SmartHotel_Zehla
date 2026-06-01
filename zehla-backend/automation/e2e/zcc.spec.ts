import { test, expect } from '@playwright/test';
import { clearAllMocks, mockZccApis } from './helpers';

test.describe('ZCC - ZEHLA Control Center', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllMocks(page);
    await mockZccApis(page);
  });

  test('deve carregar a página de login do ZCC com campos e botão', async ({ page }) => {
    await page.goto('/zcc-login', { waitUntil: 'networkidle' });

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
    await page.goto('/zcc-login', { waitUntil: 'networkidle' });

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

  test('deve interagir com os componentes do dashboard ZCC (Terminal, Kanban, Quartos)', async ({ page }) => {
    // 1. Fazer login no ZCC
    await page.goto('/zcc-login', { waitUntil: 'networkidle' });
    await page.getByPlaceholder('admin@smarthotel.com').fill('admin@smarthotel.com');
    await page.getByPlaceholder('Senha administrativa').fill('zehla2026');
    await page.getByRole('button', { name: /Acessar ZEHLA Control Center/i }).click();

    // Aguardar navegação para /zcc
    await page.waitForFunction(() => window.location.pathname === '/zcc', { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');

    // 2. Verificar que o cabeçalho e métricas de faturamento foram renderizados
    await expect(page.getByRole('heading', { name: /Zehla Control Center/i })).toBeVisible();
    await expect(page.getByText(/FATURAMENTO/i)).toBeVisible();
    await expect(page.getByText(/TAXA OCUPAÇÃO/i)).toBeVisible();
    await expect(page.getByText(/BREAK-EVEN YIELD/i)).toBeVisible();

    // 3. Verificar renderização dos 3 componentes principais do ZCC
    await expect(page.getByRole('heading', { name: /Painel de Disponibilidade e Higienização/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Funil de Negociação de Vendas/i })).toBeVisible();
    await expect(page.getByText(/ZEHLA COGNITIVE RADAR v4.0/i)).toBeVisible();

    // 4. Interação com o ajuste de Break-Even (Formulário)
    await page.getByPlaceholder('Break-Even (R$)').fill('250');
    await page.getByRole('button', { name: 'Ajustar' }).click();

    // 5. Interação com a higienização de quartos (RoomsGrid)
    const startCleaningBtn = page.getByRole('button', { name: 'Iniciar Higienização' }).first();
    await expect(startCleaningBtn).toBeVisible();
    await startCleaningBtn.click();
    await expect(page.getByText(/Limpando/i).first()).toBeVisible();

    // 6. Interação com a validação sanitária Gov.br (RoomsGrid)
    const validateFnrBtn = page.getByRole('button', { name: 'Validar FNRH (Gov.br)' }).first();
    await expect(validateFnrBtn).toBeVisible();
    await validateFnrBtn.click();
    await expect(page.getByText(/Gov.br Ok/i).first()).toBeVisible();

    // 7. Interação com o Terminal Cognitivo (Disparar intenção e receber feedback)
    await page.getByPlaceholder('Escreva uma instrução para os agentes...').fill('Solicito informações de tarifas');
    await page.getByRole('button', { name: 'Enviar' }).click();

    // Esperar pelo processamento do radar
    await page.waitForTimeout(500);
    await expect(page.getByText('CONSULTAR_SERVICOS').first()).toBeVisible();
  });
});
