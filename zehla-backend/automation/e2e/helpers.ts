import type { Page } from '@playwright/test';

/**
 * Mock the login API via network interception.
 * The route must use `**` glob (crosses `/` segments).
 */
export async function mockLoginApi(page: Page) {
  await page.route('**/api/auth/login', async (route) => {
    const reqBody = route.request().postDataJSON();
    const { email, senha } = reqBody || {};

    if (email?.trim().toLowerCase() === 'maria@pousadadosol.com.br' && senha === 'pousada123') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            tenantId: 'tenant-e2e-mock',
            token: 'mock-token-e2e',
            name: 'Maria',
            email: 'maria@pousadadosol.com.br',
            phone: '+5511999999999',
            phoneAlt: '+5511988888888',
            trialStart: new Date().toISOString(),
            plan: 'trial',
            trialDaysLeft: 7,
            isExpired: false,
            isWarning: false,
            property: {
              name: 'Pousada do Sol',
              type: 'pousada',
              city: 'São Paulo',
              state: 'SP',
              roomsCount: 5,
            },
          },
          message: 'Login realizado com sucesso',
        }),
      });
    } else {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Credenciais inválidas' }),
      });
    }
  });
}

/**
 * Mock the NextAuth session API so the dashboard works.
 */
export async function mockSessionApi(page: Page) {
  await page.route('**/api/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          name: 'Maria',
          email: 'maria@pousadadosol.com.br',
          image: null,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }),
    });
  });
}

/**
 * Clear all network mocks and app data for a clean test state.
 */
export async function clearAllMocks(page: Page) {
  await page.unrouteAll({ behavior: 'wait' });
}

/**
 * Mock ZCC APIs (concierge, revenue/tarifas) to prevent database dependencies
 */
export async function mockZccApis(page: Page) {
  // Mock Concierge API
  await page.route('**/api/hospitalidade/concierge', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        responseId: `mock-concierge-resp-${Date.now()}`,
        success: true,
        responseText: 'Aqui estão os serviços disponíveis no SmartHotel Zehla.',
        confidenceScore: 0.98,
        needsEscalation: false,
        handoffRequired: false,
      }),
    });
  });

  // Mock Revenue API
  await page.route('**/api/revenue/tarifas', async (route) => {
    const reqBody = route.request().postDataJSON();
    const { intent } = reqBody || {};

    if (intent === 'VALIDAR_BREAK_EVEN') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          responseId: `mock-rev-resp-${Date.now()}`,
          success: true,
          responseText: 'Break-even validado com sucesso.',
          confidenceScore: 0.99,
          needsEscalation: false,
          handoffRequired: false,
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          responseId: `mock-rev-resp-${Date.now()}`,
          success: true,
          responseText: 'Métricas de receita consultadas com sucesso.',
          confidenceScore: 0.99,
          needsEscalation: false,
          handoffRequired: false,
          data: {
            faturamentoTotal: 125000,
            taxaOcupacao: 72,
            revPar: 180,
            breakEvenStatus: 'safe',
          },
        }),
      });
    }
  });
}

