import { webkit } from 'playwright';
import * as path from 'path';

/**
 * Motor de Automação ZEHLA - Execução de Receitas
 * Este script carrega dinamicamente uma receita e a executa no Safari (Webkit).
 */

async function runRecipe(recipeName: string) {
  console.log(`🚀 Iniciando Motor ZEHLA no Safari...`);
  console.log(`📖 Carregando receita: ${recipeName}`);

  const browser = await webkit.launch({ 
    headless: true, // Sempre headless para economizar recursos
  });
  
  const context = await browser.newContext({
    ...require('playwright').devices['Desktop Safari'],
    /* Otimização: Bloquear imagens e recursos pesados se não for necessário */
  });

  const page = await context.newPage();

  try {
    // Tenta carregar a receita dinamicamente
    const recipePath = path.resolve(__dirname, `../automation/recipes/${recipeName}.ts`);
    const { execute } = require(recipePath);

    if (typeof execute !== 'function') {
      throw new Error(`A receita ${recipeName} não exporta uma função 'execute'.`);
    }

    console.log(`⚡ Executando...`);
    await execute(page);
    console.log(`✅ Receita concluída com sucesso.`);

  } catch (error) {
    console.error(`❌ Erro na execução da receita:`, error);
    process.exit(1);
  } finally {
    await browser.close();
    console.log(`🏁 Motor encerrado.`);
  }
}

const recipe = process.argv[2];
if (!recipe) {
  console.error('Por favor, informe o nome da receita. Ex: pnpm browser-task minha-receita');
  process.exit(1);
}

runRecipe(recipe);
