/**
 * FULL_STACK_AGENT — Reviewer Module
 * Ponto de entrada para revisão de código.
 */

import logger from '../../utils/logger.js';
import { walkDir } from '../../utils/fs.js';
import { ExecuteReviewUseCase } from './use-cases/ExecuteReviewUseCase.js';
import { SecurityRule } from './rules/SecurityRule.js';
import { CodeSmellsRule } from './rules/CodeSmellsRule.js';
import { PerformanceRule } from './rules/PerformanceRule.js';
import { LgpdRule } from './rules/LgpdRule.js';
import { TypeSafetyRule } from './rules/TypeSafetyRule.js';
import { calculateQualityScore } from './scorer.js';

/**
 * Executa o fluxo completo do módulo Reviewer
 * @param {string} projectPath 
 * @param {object} options 
 * @param {object} context 
 */
export async function runReview(projectPath, options, context) {
  logger.info('Carregando regras de revisão...');

  // Instancia as regras
  const rules = [
    new SecurityRule(),
    new CodeSmellsRule(),
    new PerformanceRule(),
    new LgpdRule(),
    new TypeSafetyRule()
  ];

  const useCase = new ExecuteReviewUseCase(rules);
  
  // Obtém lista de arquivos (usando o cache do context se houver, ou varrendo de novo)
  const files = await walkDir(projectPath);
  
  logger.info(`Revisando ${files.length} arquivos...`);
  
  const findings = await useCase.execute(context, files);
  
  // Armazena findings no contexto para os próximos módulos
  context.findings = findings;
  
  // Calcula Quality Score
  context.scores.quality = calculateQualityScore(findings);
  
  // Exibe findings no console se não estiver em modo silencioso
  findings.forEach(f => logger.finding(f));
  
  logger.score('Quality Score', context.scores.quality);
  
  return { findings, score: context.scores.quality };
}
