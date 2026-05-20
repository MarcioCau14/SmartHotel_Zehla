/**
 * FULL_STACK_AGENT — ExecuteReviewUseCase
 * Orquestrador de revisão que executa múltiplas regras sobre o projeto.
 */

import { readFile } from '../../../utils/fs.js';
import path from 'node:path';

export class ExecuteReviewUseCase {
  /**
   * @param {Array} rules - Lista de instâncias de regras a serem aplicadas
   */
  constructor(rules) {
    this.rules = rules;
  }

  /**
   * Executa a revisão em uma lista de arquivos
   * @param {object} context - ProjectContext
   * @param {string[]} filePaths - Lista de caminhos absolutos
   */
  async execute(context, filePaths) {
    const allFindings = [];

    for (const filePath of filePaths) {
      // Filtra apenas arquivos de código relevantes para revisão
      const ext = path.extname(filePath);
      if (!['.js', '.ts', '.tsx', '.jsx', '.py', '.go'].includes(ext)) continue;

      try {
        const content = await readFile(filePath);
        const fileObject = {
          path: filePath,
          relative: path.relative(context.project.root, filePath),
          content: content,
          extension: ext
        };

        for (const rule of this.rules) {
          const findings = rule.evaluate(fileObject, context);
          if (findings && findings.length > 0) {
            allFindings.push(...findings);
          }
        }
      } catch (err) {
        // Silencioso em caso de erro de leitura para não travar o pipeline
      }
    }

    return allFindings;
  }
}
