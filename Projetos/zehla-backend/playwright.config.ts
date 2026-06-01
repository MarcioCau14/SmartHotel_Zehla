import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração otimizada para o iMac (Safari/Webkit).
 * Foco em baixo consumo de recursos e alta velocidade.
 */
export default defineConfig({
  testDir: './automation/e2e',
  /* Aumentar o timeout para 60 segundos por conta do cold start do Next.js */
  timeout: 60000,
  /* Rodar testes em paralelo pode travar o iMac, então limitamos a 1 */
  fullyParallel: false,
  /* Falha o build no CI se você esqueceu de remover um .only no código */
  forbidOnly: !!process.env.CI,
  /* Retry apenas no CI */
  retries: process.env.CI ? 2 : 0,
  /* Optamos por apenas 1 worker para economizar CPU */
  workers: 1,
  /* Repórter minimalista para não poluir o terminal */
  reporter: 'list',

  use: {
    /* Base URL */
    baseURL: 'http://localhost:3000',

    /* Coletar trace apenas em falhas para economizar disco/CPU */
    trace: 'on-first-retry',

    /* Usar Webkit (Safari) para ser leve no iMac */
    browserName: 'webkit',

    /* Rodar sem janela (headless) por padrão */
    headless: true,

    /* Otimização de Performance */
    launchOptions: {
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
      ],
    },
  },

  /* Iniciar o servidor Next.js antes dos testes */
  webServer: {
    command: 'npm run dev',
    port: 3000,
    timeout: 180 * 1000,
    reuseExistingServer: !process.env.CI,
  },

  /* Projetos configurados */
  projects: [
    {
      name: 'safari',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
