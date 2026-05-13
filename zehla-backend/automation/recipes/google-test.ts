import { Page } from 'playwright';

/**
 * Receita de Teste: Pesquisa Simples no Google
 * Objetivo: Validar que o motor Webkit (Safari) está funcionando.
 */
export async function execute(page: Page) {
  console.log('🌐 Navegando para o Google...');
  await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' });
  
  const title = await page.title();
  console.log(`📌 Título da página: ${title}`);

  // Tira um screenshot para provar que funcionou (será salvo se rodar localmente)
  await page.screenshot({ path: 'google-test-result.png' });
  console.log('📸 Screenshot salvo como google-test-result.png');
}
