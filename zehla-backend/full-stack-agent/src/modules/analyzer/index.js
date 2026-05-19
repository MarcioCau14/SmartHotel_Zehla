/**
 * FULL_STACK_AGENT — Analyzer Module
 * Ponto de entrada para análise estrutural e arquitetural.
 */

import logger from '../../utils/logger.js';
import { detectFramework } from './framework.js';
import { analyzeDependencies } from './dependencies.js';
import { detectDatabase } from './database.js';
import { mapRoutes } from './routes.js';
import { calculateMaturityScore } from './scorer.js';
import { walkDir, getFileSize, getExtension } from '../../utils/fs.js';

import { DeepParser } from './parser.js';
import { NPlusOneVisitor } from './visitors/NPlusOneRule.js';
import { ReactPerformanceVisitor } from './visitors/ReactPerformanceRule.js';
import { readFile } from '../../utils/fs.js';

/**
 * Executa o fluxo completo do módulo Analyzer
 * @param {string} projectPath 
 * @param {object} options 
 * @param {object} context 
 */
export async function runAnalyze(projectPath, options, context) {
  logger.info('Iniciando varredura de arquivos...');
  
  // 1. Varredura inicial e inventário de linguagens
  const files = await walkDir(projectPath);
  context.analysis.filesAnalyzed = files.length;
  
  for (const file of files) {
    const ext = getExtension(file) || 'no-ext';
    context.analysis.extensions[ext] = (context.analysis.extensions[ext] || 0) + 1;
    context.analysis.totalSize += await getFileSize(file);
  }

  // 2. Detecção de Framework (Multi-sinal)
  logger.info('Detectando framework...');
  context.project.framework = await detectFramework(projectPath);
  context.project.language = context.project.framework.language || 'javascript';
  logger.success(`Framework: ${context.project.framework.name || 'Desconhecido'} (${context.project.framework.confidence}%)`);

  // 3. Deep Scan via AST (Inédito na V2)
  if (options.deep) {
    logger.info('Iniciando Deep Scan estrutural via AST...');
    await executeDeepScan(files, context);
  }

  // 4. Análise de Dependências
  logger.info('Analisando manifestos de dependências...');
  context.dependencies = await analyzeDependencies(projectPath, context.project.framework);

  // 5. Detecção de Banco de Dados e ORM
  logger.info('Detectando stack de persistência...');
  context.database = await detectDatabase(projectPath, context);

  // 6. Mapeamento de Rotas
  logger.info('Mapeando rotas e endpoints...');
  context.routes = await mapRoutes(projectPath, context.project.framework);

  // 7. Cálculo do Score de Maturidade
  logger.info('Calculando Maturity Score...');
  context.scores.maturity = calculateMaturityScore(context);
  
  logger.score('Maturity Score', context.scores.maturity);
  
  return context;
}

/**
 * Realiza análise estrutural em arquivos críticos
 */
async function executeDeepScan(files, context) {
  const criticalFiles = files.filter(f => 
    f.includes('/use-cases/') || 
    f.includes('/services/') || 
    f.includes('/routes/') ||
    f.includes('/components/') ||
    f.endsWith('worker.ts')
  );

  logger.info(`Deep Scan: Analisando ${criticalFiles.length} arquivos críticos.`);

  for (const file of criticalFiles) {
    logger.debug(`Deep Scan: Processando ${file}...`);
    try {
      const content = await readFile(file);
      const parsed = DeepParser.parse(content, file);
      
      const findings = [];
      NPlusOneVisitor.CallExpression(parsed, { findings, filename: file });
      ReactPerformanceVisitor.CallExpression(parsed, { findings, filename: file });

      if (findings.length > 0) {
        context.analysis.deepFindings.push(...findings);
        logger.warn(`Deep Scan: ${findings.length} problemas estruturais em ${file}`);
      }
    } catch {
      // Silencia erros de leitura para não travar o pipeline
    }
  }
}
