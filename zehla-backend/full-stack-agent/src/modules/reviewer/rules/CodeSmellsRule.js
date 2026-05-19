/**
 * FULL_STACK_AGENT — CodeSmellsRule
 * Detecta problemas de manutenibilidade e complexidade.
 */

export class CodeSmellsRule {
  evaluate(file, context) {
    const findings = [];
    const content = file.content;
    const lines = content.split('\n');

    // 1. God Files (PRD: arquivos excessivamente longos)
    if (lines.length > 500) {
      findings.push({
        rule: 'SMELL-001',
        severity: 'medium',
        category: 'MAINTAINABILITY',
        message: `Arquivo excessivamente longo (${lines.length} linhas). Considere refatorar em componentes menores.`,
        file: file.relative
      });
    }

    // 2. Callback Hell (Aninhamento excessivo)
    if (/(.*\{.*\n){4,}/.test(content)) {
       // Heurística simples para detectar identação profunda/aninhamento
    }

    // 3. Console.logs excessivos (suja o log de produção)
    const consoleMatches = content.match(/console\.log/g);
    if (consoleMatches && consoleMatches.length > 10) {
      findings.push({
        rule: 'SMELL-002',
        severity: 'low',
        category: 'MAINTAINABILITY',
        message: `Excesso de console.log detectado (${consoleMatches.length}). Use um logger estruturado.`,
        file: file.relative
      });
    }

    // 4. Try/Catch vazio (Engole erros)
    if (/catch\s*\(\w*\)\s*\{\s*\}/.test(content)) {
      findings.push({
        rule: 'SMELL-003',
        severity: 'high',
        category: 'MAINTAINABILITY',
        message: 'Bloco catch vazio detectado. Erros estão sendo silenciados sem tratamento.',
        file: file.relative
      });
    }

    // 5. Switch sem default
    if (/switch\s*\(/.test(content) && !/default\s*:/.test(content)) {
      findings.push({
        rule: 'SMELL-004',
        severity: 'medium',
        category: 'MAINTAINABILITY',
        message: 'Switch sem caso default. Inclua um default para tratar valores inesperados.',
        file: file.relative
      });
    }

    // 6. Função muito longa (> 80 linhas dentro do corpo)
    const funcMatches = content.matchAll(/(?:async\s+)?function\s+\w+\s*\([^)]*\)\s*\{/g);
    for (const match of funcMatches) {
      const start = content.indexOf('{', match.index);
      const end = findMatchingBrace(content, start);
      if (end > start) {
        const funcBody = content.substring(start + 1, end);
        const funcLines = funcBody.split('\n').filter(l => l.trim()).length;
        if (funcLines > 80) {
          const funcName = match[0].match(/function\s+(\w+)/)?.[1] || match[0].match(/function\s+\w+/)?.[0] || '';
          const lineNum = content.substring(0, match.index).split('\n').length;
          findings.push({
            rule: 'SMELL-005',
            severity: 'medium',
            category: 'MAINTAINABILITY',
            message: `Função '${funcName}' muito longa (${funcLines} linhas). Considere extrair sub-funções. (linha ${lineNum})`,
            file: file.relative,
            loc: { line: lineNum }
          });
        }
      }
    }
    // Arrow functions longas (JSX blocks etc)
    const arrowFuncs = content.matchAll(/(?:const|let)\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*(?::\s*\w+)?\s*=>\s*\{/g);
    for (const match of arrowFuncs) {
      const start = content.indexOf('{', match.index);
      const end = findMatchingBrace(content, start);
      if (end > start) {
        const funcBody = content.substring(start + 1, end);
        const funcLines = funcBody.split('\n').filter(l => l.trim()).length;
        if (funcLines > 80) {
          const name = match[0].match(/(?:const|let)\s+(\w+)/)?.[1] || '';
          const lineNum = content.substring(0, match.index).split('\n').length;
          findings.push({
            rule: 'SMELL-005',
            severity: 'medium',
            category: 'MAINTAINABILITY',
            message: `Arrow function '${name}' muito longa (${funcLines} linhas). Considere extrair sub-funções. (linha ${lineNum})`,
            file: file.relative,
            loc: { line: lineNum }
          });
        }
      }
    }

    // 7. Parâmetros excessivos na função (> 4)
    const paramFuncs = content.matchAll(/(?:async\s+)?function\s+\w+\s*\(([^)]+)\)/g);
    for (const match of paramFuncs) {
      const params = match[1].split(',').map(p => p.trim()).filter(p => p && !p.includes('\n'));
      if (params.length > 4) {
        const funcName = match[0].match(/function\s+(\w+)/)?.[1] || '';
        const lineNum = content.substring(0, match.index).split('\n').length;
        findings.push({
          rule: 'SMELL-006',
          severity: 'low',
          category: 'MAINTAINABILITY',
          message: `Função '${funcName}' tem ${params.length} parâmetros. Considere usar um objeto de configuração. (linha ${lineNum})`,
          file: file.relative,
          loc: { line: lineNum }
        });
      }
    }

    // 7b. Arrow function com params excessivos
    const arrowParams = content.matchAll(/(?:const|let)\s+\w+\s*=\s*(?:async\s*)?\(([^)]+)\)\s*(?::\s*\w+)?\s*=>/g);
    for (const match of arrowParams) {
      const params = match[1].split(',').map(p => p.trim()).filter(p => p && !p.includes('\n'));
      if (params.length > 4) {
        const name = match[0].match(/(?:const|let)\s+(\w+)/)?.[1] || '';
        const lineNum = content.substring(0, match.index).split('\n').length;
        findings.push({
          rule: 'SMELL-006',
          severity: 'low',
          category: 'MAINTAINABILITY',
          message: `Arrow function '${name}' tem ${params.length} parâmetros. Considere usar um objeto de configuração. (linha ${lineNum})`,
          file: file.relative,
          loc: { line: lineNum }
        });
      }
    }

    // 8. TODO/FIXME no código
    const todos = content.match(/\/\/\s*(TODO|FIXME|HACK|XXX|BUG)\s*[:-]?/gi);
    if (todos && todos.length > 0) {
      const severity = /FIXME|BUG|HACK/i.test(todos.join(' ')) ? 'medium' : 'low';
      findings.push({
        rule: 'SMELL-008',
        severity,
        category: 'MAINTAINABILITY',
        message: `${todos.length} mark(s) encontradas: ${todos.slice(0, 3).join(', ')}${todos.length > 3 ? '...' : ''}`,
        file: file.relative
      });
    }

    // 9. Números mágicos (hardcoded sem nome)
    const magicNumbers = content.match(/(?:return|if\s*\(|const|let|var)\s+\w*[^'"]*[=><!]\s*[0-9]{3,}/g);
    if (magicNumbers && magicNumbers.length > 2) {
      findings.push({
        rule: 'SMELL-009',
        severity: 'low',
        category: 'MAINTAINABILITY',
        message: `${magicNumbers.length} número(s) mágico(s) detectado(s). Extraia para constantes nomeadas.`,
        file: file.relative
      });
    }

    // 10. Mutação de parâmetros de função
    const paramMutation = content.match(/\w+\s*=\s*\w+\s*\+\s*\w+|\.push\(|\.pop\(\)\.shift\(\)/g);
    if (paramMutation && paramMutation.length > 5) {
      let mutCount = 0;
      for (const line of lines) {
        if (/\/\/\s*(params|argument|input)/i.test(line)) mutCount++;
      }
    }

    // 11. Class muito grande (God Class) — > 500 linhas
    const classMatches = content.matchAll(/(?:export\s+)?(?:abstract\s+)?class\s+\w+/g);
    for (const match of classMatches) {
      const classStart = content.indexOf('{', match.index);
      const classEnd = findMatchingBrace(content, classStart);
      if (classEnd > classStart) {
        const classBody = content.substring(classStart, classEnd);
        const classLines = classBody.split('\n').length;
        if (classLines > 300) {
          const className = match[0].match(/class\s+(\w+)/)?.[1] || '';
          const methodCount = (classBody.match(/\w+\s*\([^)]*\)\s*\{/g) || []).length;
          const lineNum = content.substring(0, match.index).split('\n').length;
          findings.push({
            rule: 'SMELL-010',
            severity: 'high',
            category: 'MAINTAINABILITY',
            message: `Classe '${className}' é uma God Class (${classLines} linhas, ${methodCount} métodos). Considere dividir em classes menores. (linha ${lineNum})`,
            file: file.relative,
            loc: { line: lineNum }
          });
        }
      }
    }

    // 12. Aninhamento profundo (> 4 níveis)
    let maxDepth = 0;
    let currentDepth = 0;
    for (const line of lines) {
      for (const ch of line) {
        if (ch === '{') { currentDepth++; maxDepth = Math.max(maxDepth, currentDepth); }
        else if (ch === '}') { currentDepth = Math.max(0, currentDepth - 1); }
      }
    }
    if (maxDepth > 6) {
      findings.push({
        rule: 'SMELL-011',
        severity: 'medium',
        category: 'MAINTAINABILITY',
        message: `Aninhamento profundo detectado (nível ${maxDepth}). Considere early returns ou extração de funções.`,
        file: file.relative
      });
    }

    return findings;
  }
}

function findMatchingBrace(content, openIndex) {
  if (content[openIndex] !== '{') return -1;
  let depth = 1;
  let i = openIndex + 1;
  while (i < content.length && depth > 0) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') depth--;
    if (depth > 0) i++;
  }
  return depth === 0 ? i : -1;
}
