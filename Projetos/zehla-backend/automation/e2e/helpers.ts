import type { Page } from '@playwright/test';

export async function mockLoginApi(page: Page) {
  await page.route('**/api/auth/login', async (route) => {
    const reqBody = route.request().postDataJSON();
    const { email, password } = reqBody || {};

    if (email === 'admin@ze.com' && password === '123456') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-jwt-e2e',
          user: { id: 'user-e2e', email: 'admin@ze.com', role: 'admin' },
          pousadaId: 'pousada-e2e',
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

export async function mockOnboardingApi(page: Page) {
  await page.route('**/api/comercial/leads', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { leadId: 'e2e-lead-mock' },
      }),
    });
  });
}

export async function seedAuthenticatedSession(page: Page) {
  try {
    await page.evaluate(() => {
      localStorage.setItem('zehla_session_token', 'mock-jwt-e2e');
      localStorage.setItem('zehla_pousada_id', 'pousada-e2e');
      localStorage.setItem('zehla_user_id', 'user-e2e');
      localStorage.setItem('zehla_user_role', 'admin');
    });
  } catch {
    // page may be on about:blank; caller should navigate first
  }
}

async function safeLocalStorage(page: Page) {
  try {
    await page.evaluate(() => localStorage.clear());
  } catch {
    // WebKit blocks localStorage on about:blank
  }
}

export async function clearAllMocks(page: Page) {
  await page.unrouteAll({ behavior: 'wait' });
  await safeLocalStorage(page);
}
