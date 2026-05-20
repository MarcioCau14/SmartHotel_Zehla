const EXPENSIVE_METHODS = ['sort', 'filter', 'reduce'];
const USE_MEMO_PATTERN = /useMemo\s*\(/;
const USE_CALLBACK_PATTERN = /useCallback\s*\(/;

function findEnclosingFunction(lines, lineIndex) {
  const FUNCTION_PATTERNS = [
    /(function\s+\w*\s*\([^)]*\)\s*\{)/,
    /(const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{)/,
    /(const\s+\w+\s*=\s*function\s*\([^)]*\)\s*\{)/,
    /(export\s+(default\s+)?function\s+\w*\s*\([^)]*\)\s*\{)/,
    /(export\s+(default\s+)?const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{)/,
    /(\(\s*\)\s*=>\s*\{)/,
    /(\w+\s*\([^)]*\)\s*\{)/,
  ];

  let functionStart = -1;
  let braceDepth = 0;
  let bestStart = -1;

  for (let i = lineIndex - 1; i >= 0; i--) {
    const line = lines[i];
    const opens = (line.match(/\{/g) || []).length;
    const closes = (line.match(/\}/g) || []).length;
    braceDepth += closes - opens;

    if (braceDepth < 0) {
      braceDepth = 0;
      for (const fp of FUNCTION_PATTERNS) {
        if (fp.test(line)) {
          bestStart = i;
          break;
        }
      }
      if (bestStart >= 0) break;
    }
  }

  return bestStart;
}

function findProtectedScope(lines, lineIndex) {
  for (let i = lineIndex - 1; i >= Math.max(0, lineIndex - 20); i--) {
    const line = lines[i];
    if (USE_MEMO_PATTERN.test(line) || USE_CALLBACK_PATTERN.test(line)) return true;
  }
  return false;
}

export const ReactPerformanceVisitor = {
  CallExpression({ content, filename }, { findings }) {
    if (!filename.endsWith('.tsx') && !filename.endsWith('.jsx')) return;

    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      for (const method of EXPENSIVE_METHODS) {
        const regex = new RegExp(`\\.${method}\\s*\\(`);
        if (regex.test(line)) {
          if (findProtectedScope(lines, lineNum)) continue;

          const funcStart = findEnclosingFunction(lines, lineNum);
          if (funcStart >= 0) {
            findings.push({
              rule: 'AST-REACT-001',
              severity: 'medium',
              category: 'PERFORMANCE_FRONTEND',
              message: `Cálculo custoso de array (.${method}) detectado diretamente no corpo do componente. Considere envolver com useMemo() para evitar re-cálculo em cada render.`,
              file: filename,
              loc: { line: lineNum, column: line.indexOf(`.${method}`) + 1 }
            });
          }
        }
      }
    }
  }
};
