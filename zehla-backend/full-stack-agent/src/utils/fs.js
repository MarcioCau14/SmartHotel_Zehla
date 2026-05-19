/**
 * FULL_STACK_AGENT — File System Utilities
 * Helpers para I/O usando node:fs/promises (zero deps)
 */

import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';

// Padrões globais ignorados por padrão
export const DEFAULT_IGNORE = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', 'out',
  'coverage', '.nyc_output', '__pycache__', '.cache', '.fsa-cache',
  '.fsa-reports', '.fsa-backups', 'vendor', 'venv', '.venv',
  '.turbo', '.vercel', '.netlify', 'storybook-static',
]);

/**
 * Verifica se um arquivo/diretório existe
 */
export function exists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Lê arquivo como texto (sync, para arquivos pequenos)
 */
export function readFileSync(filePath, fallback = null) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return fallback;
  }
}

/**
 * Lê arquivo como texto (async)
 */
export async function readFile(filePath) {
  return fsPromises.readFile(filePath, 'utf8');
}

/**
 * Lê e parseia JSON com fallback seguro
 */
export function readJSON(filePath, fallback = null) {
  const content = readFileSync(filePath);
  if (!content) return fallback;
  try {
    return JSON.parse(content);
  } catch {
    return fallback;
  }
}

/**
 * Escreve arquivo (cria diretórios intermediários se necessário)
 */
export async function writeFile(filePath, content) {
  await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
  return fsPromises.writeFile(filePath, content, 'utf8');
}

/**
 * Cria diretório recursivamente
 */
export async function mkdirp(dirPath) {
  return fsPromises.mkdir(dirPath, { recursive: true });
}

/**
 * Lista arquivos recursivamente com filtros
 * @param {string} dir - Diretório raiz
 * @param {object} options
 * @param {string[]} options.extensions - Extensões a incluir (ex: ['.ts', '.js'])
 * @param {Set<string>} options.ignore - Nomes de diretórios a ignorar
 * @param {number} options.maxDepth - Profundidade máxima (padrão: Infinity)
 * @param {number} options.concurrency - Máximo de I/O simultâneos (padrão: 50)
 * @returns {Promise<string[]>} - Array de caminhos absolutos
 */
export async function walkDir(dir, options = {}) {
  const {
    extensions = null,
    ignore = DEFAULT_IGNORE,
    maxDepth = Infinity,
    concurrency = 50,
  } = options;

  const results = [];
  const queue = [{ dir, depth: 0 }];
  let active = 0;

  async function processQueue() {
    while (queue.length > 0 && active < concurrency) {
      const { dir: currentDir, depth } = queue.shift();
      active++;

      try {
        const entries = await fsPromises.readdir(currentDir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);

          if (entry.isDirectory()) {
            if (!ignore.has(entry.name) && depth < maxDepth) {
              queue.push({ dir: fullPath, depth: depth + 1 });
            }
          } else if (entry.isFile()) {
            if (!extensions || extensions.includes(path.extname(entry.name))) {
              results.push(fullPath);
            }
          }
        }
      } catch {
        // Ignora erros de permissão
      } finally {
        active--;
      }
    }

    if (queue.length > 0) {
      await processQueue();
    }
  }

  await processQueue();
  return results;
}

/**
 * Versão síncrona de walkDir para casos simples
 */
export function walkDirSync(dir, options = {}) {
  const { extensions = null, ignore = DEFAULT_IGNORE, maxDepth = Infinity } = options;
  const results = [];

  function walk(currentDir, depth) {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (!ignore.has(entry.name)) walk(fullPath, depth + 1);
      } else if (entry.isFile()) {
        if (!extensions || extensions.includes(path.extname(entry.name))) {
          results.push(fullPath);
        }
      }
    }
  }

  walk(dir, 0);
  return results;
}

/**
 * Lê linhas de um arquivo grande via stream (sem carregar tudo na memória)
 * @param {string} filePath
 * @param {(line: string, lineNumber: number) => void} callback
 */
export async function readLines(filePath, callback) {
  const content = await readFile(filePath);
  const lines = content.split('\n');
  lines.forEach((line, i) => callback(line, i + 1));
}

/**
 * Retorna tamanho do arquivo em bytes
 */
export async function getFileSize(filePath) {
  try {
    const stat = await fsPromises.stat(filePath);
    return stat.size;
  } catch {
    return 0;
  }
}

/**
 * Cria backup de um arquivo em .fsa-backups/
 */
export async function backup(filePath, projectRoot) {
  const relative = path.relative(projectRoot, filePath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(projectRoot, '.fsa-backups', timestamp, relative);
  await mkdirp(path.dirname(backupPath));
  await fsPromises.copyFile(filePath, backupPath);
  return backupPath;
}

/**
 * Retorna extensão normalizada de um arquivo
 */
export function getExtension(filePath) {
  return path.extname(filePath).toLowerCase();
}

/**
 * Retorna o caminho relativo à raiz do projeto
 */
export function relative(projectRoot, filePath) {
  return path.relative(projectRoot, filePath);
}

/**
 * Lê .gitignore e retorna set de padrões a ignorar
 */
export function readGitignore(projectRoot) {
  const gitignorePath = path.join(projectRoot, '.gitignore');
  const content = readFileSync(gitignorePath, '');
  const patterns = new Set(DEFAULT_IGNORE);

  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      // Extrai apenas o nome do diretório/arquivo (sem /)
      const name = trimmed.replace(/^\//, '').replace(/\/$/, '').split('/')[0];
      if (name) patterns.add(name);
    }
  });

  return patterns;
}
