/**
 * FULL_STACK_AGENT — Project Context Model
 * Este modelo é a "fonte da verdade" que circula entre todos os módulos.
 */

import path from 'node:path';
import { getGitInfo } from '../utils/git.js';

/**
 * Cria um novo objeto de contexto de projeto
 * @param {string} root - Caminho absoluto da raiz do projeto
 * @returns {object} ProjectContext
 */
export function createProjectContext(root) {
  return {
    meta: {
      timestamp: new Date().toISOString(),
      fsaVersion: '0.1.0',
      duration: 0,
    },
    project: {
      root: root,
      name: path.basename(root),
      language: 'javascript', // Detectado pelo analyzer
      framework: {
        name: null,       // 'next.js', 'react', 'django', etc.
        version: null,
        features: [],     // 'app-router', 'ssr', 'api-routes', etc.
        confidence: 0,
      },
    },
    git: getGitInfo(root),
    dependencies: {
      manager: 'npm',     // 'npm', 'yarn', 'pnpm', 'bun'
      production: {},     // nome -> versão
      development: {},
      outdated: [],
      vulnerable: [],
    },
    database: {
      orm: null,          // 'prisma', 'typeorm', 'drizzle', 'sqlalchemy', etc.
      adapter: null,      // 'postgresql', 'sqlite', 'mysql', etc.
      migrations: false,
      models: [],
    },
    routes: {
      pages: [],          // Array<{ path, file }>
      apis: [],           // Array<{ method, path, file, middleware }>
      components: [],     // Array<{ name, file, exports }>
    },
    infra: {
      docker: false,
      ci: null,           // 'github-actions', 'gitlab-ci', etc.
      linting: null,
      formatter: null,
      env: false,         // Possui .env.example?
    },
    analysis: {
      filesAnalyzed: 0,
      totalSize: 0,       // em bytes
      extensions: {},     // contagem por extensão
      deepFindings: [],   // Resultados da análise AST
    },
    scores: {
      maturity: 0,        // Score 0-100 do Analyzer
      quality: 0,         // Score 0-100 do Reviewer
    }
  };
}
