#!/usr/bin/env node
/**
 * FULL_STACK_AGENT (FSA) — Entry Point CLI
 * Agente Full Stack Sênior — Análise, revisão, correção e normalização de projetos
 *
 * Versão: 0.1.0
 * Node.js: 20+ ESM
 * Dependências: zero
 */

import path from 'node:path';
import { parseArgs } from './cli/parser.js';
import logger from './utils/logger.js';
import { createTimer } from './utils/timer.js';
import { exists } from './utils/fs.js';
import { VERSION } from './cli/help.js';

// ─── Exit Codes ───────────────────────────────────────────────────────────────
const EXIT = {
  OK: 0,
  ERROR: 1,
  WARNINGS: 2,
  HIGH: 3,
  CRITICAL: 4,
};

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const timer = createTimer();

  // Parseia argumentos
  const { command, path: projectPath, options } = parseArgs();

  // Configura logger
  logger.configure({
    verboseMode: options.verbose,
    ci: options.ci,
    noColor: options.noColor,
  });

  // Banner (apenas modo interativo)
  if (!options.ci) {
    logger.banner(VERSION);
  }

  // Resolve caminho absoluto do projeto
  const absolutePath = path.resolve(process.cwd(), projectPath);

  // Verifica se o caminho existe
  if (!exists(absolutePath)) {
    logger.error(`Caminho não encontrado: ${absolutePath}`);
    process.exit(EXIT.ERROR);
  }

  logger.info(`Projeto: ${absolutePath}`);
  logger.info(`Comando: ${command}`);
  if (options.deep) logger.info('Modo: deep analysis ativado');
  if (options.dryRun) logger.info('Modo: dry-run (nenhum arquivo será modificado)');

  // ─── Setup de Contexto e Config ─────────────────────────────────────────────
  const { createProjectContext } = await import('./core/context.js');
  const { loadConfig } = await import('./core/config.js');
  
  const context = createProjectContext(absolutePath);
  const config = await loadConfig(absolutePath);

  // ─── Dispatcher de comandos ─────────────────────────────────────────────────
  let exitCode = EXIT.OK;

  try {
    switch (command) {
      case 'analyze': {
        const { runAnalyze } = await import('./modules/analyzer/index.js');
        const result = await runAnalyze(absolutePath, options, context);
        exitCode = resolveExitCode(result, options);
        break;
      }

      case 'review': {
        const { runReview } = await import('./modules/reviewer/index.js');
        const result = await runReview(absolutePath, options, context);
        exitCode = resolveExitCode(result, options);
        break;
      }

      case 'fix': {
        const { runFix } = await import('./modules/fixer/index.js');
        const result = await runFix(absolutePath, options, context);
        exitCode = resolveExitCode(result, options);
        break;
      }

      case 'infra': {
        const { runInfra } = await import('./modules/infra/index.js');
        const result = await runInfra(absolutePath, options, context);
        exitCode = resolveExitCode(result, options);
        break;
      }

      case 'generate': {
        const { runGenerate } = await import('./modules/generator/index.js');
        const result = await runGenerate(absolutePath, options, context);
        exitCode = resolveExitCode(result, options);
        break;
      }

      case 'ai': {
        const { runAi } = await import('./modules/ai/index.js');
        await runAi(absolutePath, options, context);
        break;
      }

      case 'full': {
        const { runFull } = await import('./core/orchestrator.js');
        const result = await runFull(absolutePath, options);
        exitCode = resolveExitCode(result, options);
        break;
      }

      default:
        logger.error(`Comando desconhecido: ${command}`);
        exitCode = EXIT.ERROR;
    }

    // Geração de relatórios para comandos individuais
    if (options.report && command !== 'full') {
      const { generateReports } = await import('./reports/index.js');
      await generateReports(context, options);
    }
  } catch (err) {
    logger.error('Erro inesperado durante execução', { error: err });
    if (options.verbose) {
      process.stderr.write(err.stack + '\n');
    }
    exitCode = EXIT.ERROR;
  }

  // Sumário de tempo
  const elapsed = timer.format();
  if (!options.ci) {
    logger.br();
    logger.info(`Concluído em ${elapsed}`);
  } else {
    process.stdout.write(`FSA_DONE ${elapsed}\n`);
  }

  process.exit(exitCode);
}

// ─── Resolve Exit Code ─────────────────────────────────────────────────────────
function resolveExitCode(result, options) {
  if (!options.ci || !result) return EXIT.OK;

  const { summary } = result;
  if (!summary) return EXIT.OK;

  if (summary.critical > 0) return EXIT.CRITICAL;
  if (summary.high > 0) return EXIT.HIGH;
  if (summary.medium > 0 || summary.low > 0) return EXIT.WARNINGS;

  return EXIT.OK;
}

// ─── Run ────────────────────────────────────────────────────────────────────────
main().catch(err => {
  process.stderr.write(`\n  ✖ Erro fatal: ${err.message}\n\n`);
  process.exit(EXIT.ERROR);
});
