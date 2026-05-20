/**
 * FULL_STACK_AGENT — Orchestrator
 * Coordena o fluxo: Analyze -> Review -> Fix -> Infra -> Generate
 */

import logger from '../utils/logger.js';
import { createProjectContext } from './context.js';
import { loadConfig } from './config.js';
import { createTimer } from '../utils/timer.js';

/**
 * Executa o pipeline completo solicitado
 * @param {string} projectPath 
 * @param {object} options 
 */
export async function runFull(projectPath, options) {
  const timer = createTimer();
  logger.section('INICIANDO PIPELINE FULL STACK AGENT');

  // 1. Setup inicial
  const context = createProjectContext(projectPath);
  const config = await loadConfig(projectPath);
  
  // No modo runFull, o comando implícito é 'full'
  const cmd = options.command || 'full';

  // 2. Módulo Analyzer (Fase 1)
  logger.info('Iniciando análise estrutural...');
  const { runAnalyze } = await import('../modules/analyzer/index.js');
  await runAnalyze(projectPath, options, context);

  // 3. Módulo Reviewer (Fase 2)
  if (cmd === 'review' || cmd === 'full' || cmd === 'fix') {
    logger.info('Iniciando revisão de código...');
    const { runReview } = await import('../modules/reviewer/index.js');
    await runReview(projectPath, options, context);
  }

  // 4. Módulo Fixer (Fase 3)
  if (options.fix && (cmd === 'fix' || cmd === 'full' || cmd === 'review')) {
    logger.info('Iniciando correções automáticas...');
    const { runFix } = await import('../modules/fixer/index.js');
    await runFix(projectPath, options, context);
  }

  // 5. Módulo Infra (Fase 4)
  if (cmd === 'infra' || cmd === 'full') {
    logger.info('Gerando infraestrutura...');
    const { runInfra } = await import('../modules/infra/index.js');
    await runInfra(projectPath, options, context);
  }

  // 6. Módulo Generator (Fase 4)
  if (cmd === 'generate' || cmd === 'full') {
    logger.info('Gerando templates e componentes...');
    const { runGenerate } = await import('../modules/generator/index.js');
    await runGenerate(projectPath, options, context);
  }

  // 7. Relatório Final
  logger.section('GERANDO RELATÓRIOS');
  const { generateReports } = await import('../reports/index.js');
  await generateReports(context, options);

  logger.section('PIPELINE CONCLUÍDO');
  logger.success(`Análise finalizada com sucesso em ${timer.format()}`);
  
  return { context, summary: context.scores };
}
