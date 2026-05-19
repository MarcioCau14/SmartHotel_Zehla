/**
 * FULL_STACK_AGENT — Infra Module
 * Ponto de entrada para geração de infraestrutura (Dockerfile, CI/CD, etc).
 */

import logger from '../../utils/logger.js';
import { GitHubActionsGenerator } from './github-actions.js';
import { DockerGenerator } from './docker.js';
import { VercelGenerator } from './vercel.js';
import { LinterGenerator } from './linter.js';
import { EnvGenerator } from './env.js';

/**
 * Executa o fluxo completo do módulo Infra
 * @param {string} projectPath 
 * @param {object} options 
 * @param {object} context 
 */
export async function runInfra(projectPath, options, context) {
  logger.info('Iniciando geração de infraestrutura estratégica...');

  const results = [];

  // 1. Gerar GitHub Actions
  const githubGen = new GitHubActionsGenerator();
  const githubResult = await githubGen.generate(projectPath, context);
  results.push(githubResult);
  if (githubResult.status === 'CREATED') {
    logger.success(`[INFRA] CI/CD Workflow gerado: ${githubResult.path}`);
  } else {
    logger.info(`[INFRA] CI/CD: ${githubResult.message}`);
  }

  // 2. Gerar Dockerfile
  const dockerGen = new DockerGenerator();
  const dockerResult = await dockerGen.generate(projectPath, context);
  results.push(dockerResult);
  if (dockerResult.status === 'CREATED') {
    logger.success(`[INFRA] Dockerfile multi-stage gerado.`);
  } else {
    logger.info(`[INFRA] Docker: ${dockerResult.message}`);
  }

  // 3. Gerar vercel.json
  const vercelGen = new VercelGenerator();
  const vercelResult = await vercelGen.generate(projectPath, context);
  results.push(vercelResult);
  if (vercelResult.status === 'CREATED') {
    logger.success(`[INFRA] vercel.json gerado.`);
  } else {
    logger.info(`[INFRA] Vercel: ${vercelResult.message}`);
  }

  // 4. Gerar ESLint + Prettier
  const linterGen = new LinterGenerator();
  const linterResult = await linterGen.generate(projectPath, context);
  results.push(linterResult);

  // 5. Gerar .env.example + .gitignore
  const envGen = new EnvGenerator();
  const envResult = await envGen.generate(projectPath, context);
  results.push(envResult);

  return { status: 'COMPLETED', results };
}
