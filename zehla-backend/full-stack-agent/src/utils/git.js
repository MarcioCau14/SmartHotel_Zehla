/**
 * FULL_STACK_AGENT — Git Integration Helpers
 * Integração com Git usando node:child_process (zero deps)
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import { exists } from './fs.js';

/**
 * Verifica se o diretório é um repositório Git
 */
export function isGitRepo(projectRoot) {
  return exists(path.join(projectRoot, '.git'));
}

/**
 * Executa um comando git e retorna o output
 */
function git(command, cwd) {
  try {
    return execSync(`git ${command}`, {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return null;
  }
}

/**
 * Retorna informações do repositório Git
 */
export function getGitInfo(projectRoot) {
  if (!isGitRepo(projectRoot)) {
    return { isRepo: false };
  }

  const branch = git('rev-parse --abbrev-ref HEAD', projectRoot);
  const remote = git('remote get-url origin', projectRoot);
  const lastCommit = git('log -1 --format="%H|%s|%an|%ae|%ai"', projectRoot);
  const status = git('status --porcelain', projectRoot);
  const uncommitted = status ? status.split('\n').filter(Boolean).length : 0;

  let commitInfo = null;
  if (lastCommit) {
    const [hash, subject, author, email, date] = lastCommit.split('|');
    commitInfo = { hash: hash?.slice(0, 8), subject, author, email, date };
  }

  return {
    isRepo: true,
    branch,
    remote,
    uncommittedChanges: uncommitted,
    lastCommit: commitInfo,
  };
}

/**
 * Lista arquivos modificados desde o último commit
 */
export function getModifiedFiles(projectRoot) {
  if (!isGitRepo(projectRoot)) return [];
  const output = git('diff --name-only HEAD', projectRoot);
  if (!output) return [];
  return output.split('\n').filter(Boolean).map(f => path.join(projectRoot, f));
}

/**
 * Lista arquivos staged (prontos para commit)
 */
export function getStagedFiles(projectRoot) {
  if (!isGitRepo(projectRoot)) return [];
  const output = git('diff --cached --name-only', projectRoot);
  if (!output) return [];
  return output.split('\n').filter(Boolean).map(f => path.join(projectRoot, f));
}

/**
 * Retorna o remote URL do repositório (ex: github.com/user/repo)
 */
export function getRemoteUrl(projectRoot) {
  const remote = git('remote get-url origin', projectRoot);
  if (!remote) return null;

  // Normaliza SSH e HTTPS para formato uniforme
  return remote
    .replace('git@github.com:', 'github.com/')
    .replace('https://github.com/', 'github.com/')
    .replace('.git', '');
}

/**
 * Verifica se o projeto usa GitHub (para sugerir GitHub Actions)
 */
export function isGitHub(projectRoot) {
  const url = getRemoteUrl(projectRoot);
  return url?.includes('github.com') ?? false;
}

/**
 * Retorna contribuidores do projeto
 */
export function getContributors(projectRoot) {
  if (!isGitRepo(projectRoot)) return [];
  const output = git('log --format="%an" | sort -u', projectRoot);
  if (!output) return [];
  return [...new Set(output.split('\n').filter(Boolean))];
}
