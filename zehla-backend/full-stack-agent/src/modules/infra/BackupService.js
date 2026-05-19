/**
 * FULL_STACK_AGENT — BackupService
 * Garante que nenhuma alteração seja feita sem um ponto de restauração.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

export class BackupService {
  /**
   * Cria um backup do arquivo antes da alteração
   * @param {string} filePath - Caminho absoluto do arquivo original
   * @param {string} projectRoot - Raiz do projeto para organizar a pasta .fsa-backups
   */
  async createBackup(filePath, projectRoot) {
    const backupDir = path.join(projectRoot, '.fsa-backups');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Mantém a estrutura de pastas original dentro do backup
    const relativePath = path.relative(projectRoot, filePath);
    const backupPath = path.join(backupDir, timestamp, relativePath);

    try {
      await fs.mkdir(path.dirname(backupPath), { recursive: true });
      await fs.copyFile(filePath, backupPath);
      return backupPath;
    } catch (err) {
      throw new Error(`Falha ao criar backup de ${filePath}: ${err.message}`);
    }
  }
}
