import { defineConfig, devices } from '@playwright/test';


/**
 * Configuração otimizada para o iMac (Safari/Webkit).
 * Foco em baixo consumo de recursos e alta velocidade.
 */
export default defineConfig({
  testDir: './automation/recipes',
  /* Rodar testes em paralelo pode travar o iMac, então limitamos a 1 */
  fullyParallel: false,
  /* Falha o build no CI se você esqueceu de remover um .only no código */
  forbidOnly: !!process.env.CI,
  /* Retry apenas no CI */
  retries: process.env.CI ? 2 : 0,
  /* Optamos por apenas 1 worker para economizar CPU */
  workers: 1,
  /* Repórter minimalista para não poluir o terminal */
  reporter: 'line',
  
  use: {
    /* Base URL se necessário */
    // baseURL: 'http://localhost:3000',

    /* Coletar trace apenas em falhas para economizar disco/CPU */
    trace: 'on-first-retry',
    
    /* DEFINIÇÃO CRÍTICA: Usar Webkit (Safari) para ser leve no iMac */
    browserName: 'webkit',
    
    /* Rodar sem janela (headless) por padrão para máxima performance */
    headless: true,

    /* Otimização de Performance: Bloquear recursos pesados */
    launchOptions: {
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
      ],
    },
  },

  /* Projetos configurados */
  projects: [
    {
      name: 'safari',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
