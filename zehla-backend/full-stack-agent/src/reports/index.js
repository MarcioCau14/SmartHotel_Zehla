/**
 * FULL_STACK_AGENT — Reporter Module
 * Ponto central de geração de relatórios (MD, JSON, HTML).
 */

import { writeFile, mkdirp } from '../utils/fs.js';
import logger from '../utils/logger.js';
import path from 'node:path';
import { generateMarkdownReport } from './markdown.js';
import { generateJsonReport } from './json.js';

/**
 * Gera e salva os relatórios solicitados
 * @param {object} context 
 * @param {object} options 
 */
export async function generateReports(context, options) {
  const outputDir = path.resolve(context.project.root, options.output || '.fsa-reports');
  await mkdirp(outputDir);

  const format = options.report || 'md';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  
  logger.info(`Gerando relatório no formato: ${format}...`);

  if (format === 'md' || format === 'all') {
    const content = generateMarkdownReport(context);
    const fileName = `report-${timestamp}.md`;
    await writeFile(path.join(outputDir, fileName), content);
    logger.success(`Relatório Markdown gerado: ${fileName}`);
  }

  if (format === 'json' || format === 'all') {
    const content = generateJsonReport(context);
    const fileName = `report-${timestamp}.json`;
    await writeFile(path.join(outputDir, fileName), content);
    logger.success(`Relatório JSON gerado: ${fileName}`);
  }

  if (format === 'html' || format === 'all') {
    const { generateHtmlReport } = await import('./html.js');
    const content = generateHtmlReport(context);
    const fileName = `dashboard-${timestamp}.html`;
    await writeFile(path.join(outputDir, fileName), content);
    logger.success(`Dashboard HTML gerado: ${fileName}`);
  }
}
