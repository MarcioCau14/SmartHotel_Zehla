import fs from 'node:fs/promises';
import path from 'node:path';
import logger from '../../../utils/logger.js';

export const withBackup = (fixOperation) => {
    return async (absolutePath, originalContent, projectRoot) => {
        const backupDir = path.join(projectRoot, '.fsa-backups');

        try {
            await fs.mkdir(backupDir, { recursive: true });
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = path.basename(absolutePath);
            const backupPath = path.join(backupDir, `${timestamp}-${fileName}.bak`);

            await fs.writeFile(backupPath, originalContent, 'utf-8');

            const newContent = await fixOperation(originalContent, absolutePath);

            if (newContent !== originalContent) {
                await fs.writeFile(absolutePath, newContent, 'utf-8');
                return { status: 'FIXED', backupFile: backupPath };
            }
            
            return { status: 'SKIPPED' };
        } catch (error) {
            try {
                await fs.writeFile(absolutePath, originalContent, 'utf-8');
                logger.error(`Erro ao corrigir ${path.basename(absolutePath)}. Rollback aplicado.`);
            } catch (rollbackError) {
                logger.error(`Falha no rollback: ${rollbackError.message}`);
            }
            throw error;
        }
    };
};
