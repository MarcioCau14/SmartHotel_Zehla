/**
 * FULL_STACK_AGENT — Config Manager
 * Carrega e valida o arquivo .fsa.conf da raiz do projeto alvo.
 */

import path from 'node:path';
import { exists } from '../utils/fs.js';

const DEFAULT_CONFIG = {
  ignore: [],
  rules: {
    disable: [],
    severity: {
      'SEC-*': 'critical',
      'PERF-*': 'high'
    }
  },
  fix: {
    autoFix: ['imports', 'console', 'unused-vars'],
    confirmFirst: ['types', 'error-handling', 'dead-code']
  },
  report: {
    format: 'md',
    output: '.fsa-reports'
  },
  ai: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-5',
    maxTokens: 100000
  }
};

/**
 * Carrega a configuração do projeto
 * @param {string} projectRoot 
 * @returns {Promise<object>}
 */
export async function loadConfig(projectRoot) {
  const configPath = path.join(projectRoot, '.fsa.conf');
  
  if (!exists(configPath)) {
    return DEFAULT_CONFIG;
  }

  try {
    // Importa dinamicamente a configuração JS do projeto
    const userConfig = await import(`file://${configPath}`);
    return {
      ...DEFAULT_CONFIG,
      ...userConfig.default,
      // Faz merge profundo de objetos específicos se necessário
      rules: { ...DEFAULT_CONFIG.rules, ...(userConfig.default?.rules || {}) },
      fix: { ...DEFAULT_CONFIG.fix, ...(userConfig.default?.fix || {}) },
      ai: { ...DEFAULT_CONFIG.ai, ...(userConfig.default?.ai || {}) }
    };
  } catch (err) {
    // Se falhar (ex: syntax error), retorna default e avisa (seria feito via logger no orchestrator)
    return DEFAULT_CONFIG;
  }
}
