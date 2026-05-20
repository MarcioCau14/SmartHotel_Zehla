/**
 * FULL_STACK_AGENT — Fixer Module
 * Ponto de entrada para aplicação de correções automáticas.
 */

import logger from '../../utils/logger.js';
import { ExecuteFixUseCase } from './use-cases/ExecuteFixUseCase.js';
import { RemoveConsoleLogRule } from './rules/RemoveConsoleLogRule.js';
import { OrganizeImportsRule } from './rules/OrganizeImportsRule.js';
import { TypeFixRule } from './rules/TypeFixRule.js';
import { ErrorHandlingRule } from './rules/ErrorHandlingRule.js';
import { DeadCodeRule } from './rules/DeadCodeRule.js';

/**
 * Executa o fluxo completo do módulo Fixer
 * @param {string} projectPath 
 * @param {object} options 
 * @param {object} context 
 */
export async function runFix(projectPath, options, context) {
  if (!options.fix && !options.dryRun) {
    logger.warn('Modo Fixer chamado sem a flag --fix ou --dry-run. Nada será alterado.');
    return { fixedCount: 0 };
  }

  logger.info('Carregando regras de correção seguras...');

  const rules = [
    new RemoveConsoleLogRule(),
    new OrganizeImportsRule(),
    new TypeFixRule(),
    new ErrorHandlingRule(),
    new DeadCodeRule()
  ];

  const useCase = new ExecuteFixUseCase(rules);
  
  logger.info('Aplicando correções automáticas...');
  const fixedFiles = await useCase.execute(context, options);
  
  if (fixedFiles.length > 0) {
    logger.success(`${fixedFiles.length} arquivos corrigidos com sucesso.`);
  } else {
    logger.info('Nenhuma correção necessária encontrada.');
  }

  return { fixedCount: fixedFiles.length, files: fixedFiles };
}
