#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

function findRouteFiles(dir) {
  const results = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      if (entry === 'node_modules' || entry.startsWith('.')) continue;
      if (statSync(fullPath).isDirectory()) {
        results.push(...findRouteFiles(fullPath));
      } else if (entry === 'route.ts') {
        results.push(fullPath);
      }
    }
  } catch {}
  return results;
}

const IMPORT_LINE = `import { withApiSecurity } from '@/lib/server/with-api-security';`;

const routeFiles = findRouteFiles('src/app/api');

let modified = 0;
let skipped = 0;
let errors = [];

for (const file of routeFiles) {
  try {
    let content = readFileSync(file, 'utf-8');
    const original = content;

    // Skip NextAuth route
    if (file.includes('[...nextauth]')) {
      skipped++;
      continue;
    }

    // Check if already has Guardian rate limiting
    if (content.includes('Guardian.checkRateLimit') || content.includes('rateLimit(')) {
      skipped++;
      continue;
    }

    // Check if already has withApiSecurity
    if (content.includes('withApiSecurity')) {
      skipped++;
      continue;
    }

    // Find all exported async functions (GET, POST, PUT, PATCH, DELETE)
    const handlerRegex = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(/g;
    const handlers = [];
    let match;
    while ((match = handlerRegex.exec(content)) !== null) {
      handlers.push(match[1]);
    }

    if (handlers.length === 0) {
      skipped++;
      continue;
    }

    // Determine if this is a webhook route
    const isWebhook = file.includes('webhooks/') || file.includes('blast/webhook');

    // Determine rate limit config
    let rlConfig = '';
    if (isWebhook) {
      rlConfig = ', { rateLimit: { limit: 300, windowSeconds: 60 } }';
    } else if (handlers.some(h => h === 'GET')) {
      rlConfig = ', { rateLimit: { limit: 100, windowSeconds: 60 } }';
    } else {
      rlConfig = ', { rateLimit: { limit: 30, windowSeconds: 60 } }';
    }

    // Add import if not present
    if (!content.includes('withApiSecurity')) {
      const lastImport = content.lastIndexOf('import ');
      const nextLineAfterImport = content.indexOf('\n', lastImport);
      const insertPos = nextLineAfterImport + 1;
      content = content.slice(0, insertPos) + '\n' + IMPORT_LINE + content.slice(insertPos);
    }

    // Transform each handler: export async function -> async function, then add export const
    for (const handlerName of handlers) {
      const searchStr = `export async function ${handlerName}(`;
      const replaceStr = `async function _${handlerName}(`;
      content = content.replace(searchStr, replaceStr);

      // Add export const line after the function ends
      // Find where the function body ends by counting braces
      // Simple approach: find the closing brace at the right level
      const funcStart = content.indexOf(`async function _${handlerName}(`);
      if (funcStart === -1) continue;

      // Find the function end by counting brace depth
      let braceCount = 0;
      let funcEnd = funcStart;
      let started = false;
      for (let i = funcStart; i < content.length; i++) {
        if (content[i] === '{') { braceCount++; started = true; }
        else if (content[i] === '}') { braceCount--; }
        if (started && braceCount === 0) { funcEnd = i + 1; break; }
      }

      const afterFunc = content.slice(funcEnd);
      const indent = '  '; // 2 spaces for Next.js routes
      const exportLine = `\n${indent}export const ${handlerName} = withApiSecurity(_${handlerName}${rlConfig});\n`;
      content = content.slice(0, funcEnd) + exportLine + afterFunc;
    }

    if (content !== original) {
      writeFileSync(file, content, 'utf-8');
      modified++;
      console.log(`✔ ${file} — wrapped ${handlers.join(', ')}`);
    } else {
      skipped++;
    }
  } catch (err) {
    errors.push({ file, error: err.message });
    console.error(`✖ ${file}: ${err.message}`);
  }
}

console.log(`\nDone. Modified: ${modified}, Skipped: ${skipped}, Errors: ${errors.length}`);
if (errors.length > 0) {
  console.log('Errors:', errors.map(e => `${e.file}: ${e.error}`).join('\n'));
}
