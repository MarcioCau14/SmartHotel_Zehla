/**
 * FULL_STACK_AGENT — Dependency Analysis
 * Processa manifestos (package.json, requirements.txt, etc.)
 */

import path from 'node:path';
import { exists, readJSON, readFileSync } from '../../utils/fs.js';

/**
 * Analisa as dependências do projeto
 * @param {string} projectRoot 
 * @param {object} framework 
 * @returns {Promise<object>}
 */
export async function analyzeDependencies(projectRoot, framework) {
  const result = {
    manager: 'npm',
    production: {},
    development: {},
    outdated: [],
    vulnerable: []
  };

  // 1. Detecta o Package Manager (JS)
  if (exists(path.join(projectRoot, 'bun.lockb'))) result.manager = 'bun';
  else if (exists(path.join(projectRoot, 'pnpm-lock.yaml'))) result.manager = 'pnpm';
  else if (exists(path.join(projectRoot, 'yarn.lock'))) result.manager = 'yarn';

  // 2. Processa package.json
  const pkgPath = path.join(projectRoot, 'package.json');
  if (exists(pkgPath)) {
    const pkg = readJSON(pkgPath, {});
    result.production = pkg.dependencies || {};
    result.development = pkg.devDependencies || {};
  }

  // 3. Processa requirements.txt (Python)
  const reqPath = path.join(projectRoot, 'requirements.txt');
  if (exists(reqPath)) {
    const lines = readFileSync(reqPath, '').split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [name, version] = trimmed.split('==');
        result.production[name] = version || 'latest';
      }
    });
  }

  return result;
}
