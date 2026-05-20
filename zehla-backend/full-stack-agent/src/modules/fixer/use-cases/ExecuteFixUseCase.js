import { withBackup } from '../utils/backupWrapper.js';
import logger from '../../../utils/logger.js';
import { writeFile, readFile } from '../../../utils/fs.js';
import { walkDir } from '../../../utils/fs.js';

export class ExecuteFixUseCase {
  constructor(fixRules, astFixRules = []) {
    this.fixRules = fixRules;
    this.astFixRules = astFixRules;
  }

  async execute(context, options) {
    const fixedFiles = new Set();

    const srcExtensions = new Set(['.js', '.ts', '.tsx', '.jsx', '.mjs', '.cjs']);

    const projectRoot = context.project.root;
    const allFiles = await walkDir(projectRoot);

    for (const rule of this.fixRules) {
      for (const filePath of allFiles) {
        const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
        if (!srcExtensions.has(ext)) continue;
        if (filePath.includes('node_modules') || filePath.includes('.git')) continue;

        try {
          const originalContent = await readFile(filePath);
          const newContent = rule.apply(originalContent, filePath);

          if (newContent !== originalContent) {
            if (!options.dryRun) {
              const wrappedFix = withBackup(() => newContent);
              const result = await wrappedFix(filePath, originalContent, projectRoot);
              if (result.status === 'FIXED') {
                fixedFiles.add(filePath);
                logger.success(`[FIXED] ${filePath.replace(projectRoot, '')}`);
              }
            } else {
              fixedFiles.add(filePath);
              logger.info(`[DRY-RUN] Seria corrigido: ${filePath.replace(projectRoot, '')}`);
            }
          }
        } catch {
          // Silencia erros por arquivo
        }
      }
    }

    return Array.from(fixedFiles);
  }
}
