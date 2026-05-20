/**
 * FULL_STACK_AGENT — Generator Module
 * Ponto de entrada para geração de templates e componentes.
 */

import logger from '../../utils/logger.js';
import { writeFile } from '../../utils/fs.js';
import { DiffEngine } from './diff-engine.js';

export async function runGenerate(projectPath, options, context) {
  logger.info('Iniciando geração de templates...');

  const engine = new DiffEngine();
  const framework = context.project.framework.name;
  
  // Biblioteca de templates baseada no framework
  const templates = [];

  if (framework === 'Next.js') {
    templates.push(
      { path: 'src/components/ui/Button.tsx', content: 'export const Button = () => <button className="px-4 py-2 bg-blue-500 text-white rounded">Click me</button>;' },
      { path: 'src/components/ui/Card.tsx', content: 'export const Card = ({children}) => <div className="p-4 border rounded shadow">{children}</div>;' }
    );
  }

  const plan = await engine.inventory(projectPath, templates);
  
  for (const item of plan) {
    if (item.action === 'CREATE') {
      if (!options.dryRun) {
        await writeFile(item.fullPath, item.content);
        logger.success(`[CREATED] ${item.path}`);
      } else {
        logger.info(`[DRY-RUN] Seria criado: ${item.path}`);
      }
    } else {
      logger.debug(`[SKIPPED] ${item.path} já existe.`);
    }
  }

  return plan;
}
