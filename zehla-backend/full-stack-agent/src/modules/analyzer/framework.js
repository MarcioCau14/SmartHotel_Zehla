/**
 * FULL_STACK_AGENT — Framework Detection
 * Implementa heurísticas multi-sinal (PRD 3.2) para identificar o framework.
 */

import path from 'node:path';
import { exists, readJSON, walkDirSync } from '../../utils/fs.js';

/**
 * Detecta o framework principal do projeto
 * @param {string} projectRoot 
 * @returns {Promise<object>} Framework info
 */
export async function detectFramework(projectRoot) {
  const pkg = readJSON(path.join(projectRoot, 'package.json'), {});
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  let name = 'Desconhecido';
  let version = null;
  let features = [];
  let confidence = 0;
  let language = 'javascript';

  // 1. Sinais: Next.js
  if (deps['next']) {
    name = 'Next.js';
    version = deps['next'];
    confidence = 90;
    if (exists(path.join(projectRoot, 'app'))) features.push('app-router');
    if (exists(path.join(projectRoot, 'pages'))) features.push('pages-router');
    if (exists(path.join(projectRoot, 'next.config.js')) || exists(path.join(projectRoot, 'next.config.mjs'))) {
      confidence = 100;
    }
  } 
  // 2. Sinais: React (CRA/Vite)
  else if (deps['react']) {
    name = 'React';
    version = deps['react'];
    confidence = 80;
    if (deps['vite']) {
      name = 'React (Vite)';
      confidence = 100;
    }
  }
  // 3. Sinais: Django (Python)
  else if (exists(path.join(projectRoot, 'manage.py'))) {
    name = 'Django';
    language = 'python';
    confidence = 100;
    if (exists(path.join(projectRoot, 'requirements.txt'))) features.push('pip');
  }
  // 4. Sinais: Express
  else if (deps['express']) {
    name = 'Express';
    version = deps['express'];
    confidence = 90;
  }

  // Detecta se é TypeScript
  if (deps['typescript'] || exists(path.join(projectRoot, 'tsconfig.json'))) {
    features.push('typescript');
    language = 'typescript';
  }

  return { name, version, features, confidence, language };
}
