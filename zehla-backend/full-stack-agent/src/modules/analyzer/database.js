/**
 * FULL_STACK_AGENT — Database Detection
 * Identifica ORMs e Bancos de Dados.
 */

import path from 'node:path';
import { exists, readFileSync, walkDirSync } from '../../utils/fs.js';

/**
 * Detecta stack de banco de dados e ORM
 * @param {string} projectRoot 
 * @param {object} context 
 * @returns {Promise<object>}
 */
export async function detectDatabase(projectRoot, context) {
  const deps = { ...context.dependencies.production, ...context.dependencies.development };
  const dbInfo = {
    orm: null,
    adapter: null,
    migrations: false,
    models: []
  };

  // 1. Prisma
  if (deps['@prisma/client'] || exists(path.join(projectRoot, 'prisma'))) {
    dbInfo.orm = 'prisma';
    const schemaPath = path.join(projectRoot, 'prisma', 'schema.prisma');
    if (exists(schemaPath)) {
      const content = readFileSync(schemaPath, '');
      // Detecção básica de adapter no schema.prisma
      if (content.includes('provider = "sqlite"')) dbInfo.adapter = 'sqlite';
      if (content.includes('provider = "postgresql"')) dbInfo.adapter = 'postgresql';
      if (content.includes('provider = "mysql"')) dbInfo.adapter = 'mysql';
      
      // Extração simples de models
      const modelMatches = content.matchAll(/model\s+(\w+)\s+{/g);
      for (const match of modelMatches) {
        dbInfo.models.push(match[1]);
      }
    }
    if (exists(path.join(projectRoot, 'prisma', 'migrations'))) {
      dbInfo.migrations = true;
    }
  }
  // 2. Drizzle
  else if (deps['drizzle-orm']) {
    dbInfo.orm = 'drizzle';
    if (exists(path.join(projectRoot, 'drizzle.config.ts'))) confidence = 100;
  }
  // 3. Mongoose
  else if (deps['mongoose']) {
    dbInfo.orm = 'mongoose';
    dbInfo.adapter = 'mongodb';
  }

  return dbInfo;
}
