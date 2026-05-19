/**
 * FULL_STACK_AGENT — DiffEngine
 * Garante que o gerador seja idempotente, criando apenas arquivos faltantes.
 */

import { exists } from '../../utils/fs.js';

export class DiffEngine {
  /**
   * Avalia quais arquivos de um conjunto de templates precisam ser criados
   * @param {string} projectRoot 
   * @param {Array<{path: string, content: string}>} templates 
   * @returns {Array} Inventário de ações (CREATE, SKIP, CONFLICT)
   */
  async inventory(projectRoot, templates) {
    const plan = [];

    for (const template of templates) {
      const fullPath = `${projectRoot}/${template.path}`;
      
      if (!exists(fullPath)) {
        plan.push({ ...template, action: 'CREATE', fullPath });
      } else {
        // Se já existe, por enquanto pulamos (idempotência básica)
        // Na v2.0 poderíamos fazer um diff real do conteúdo
        plan.push({ ...template, action: 'SKIP', fullPath });
      }
    }

    return plan;
  }
}
