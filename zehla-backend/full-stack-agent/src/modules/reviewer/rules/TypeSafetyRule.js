const TS_EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.cts']);

export class TypeSafetyRule {
  evaluate(file, context) {
    const findings = [];
    const ext = '.' + file.path.split('.').pop();
    if (!TS_EXTENSIONS.has(ext)) return findings;

    const content = file.content;
    const lines = content.split('\n');

    // 1. Uso de `any` (cada ocorrência)
    const anyMatches = content.matchAll(/: any\b|as any\b|\bany\[\]|any\s*[)\]},;]/g);
    let anyCount = 0;
    for (const match of anyMatches) {
      anyCount++;
      if (anyCount <= 3) {
        const lineNum = content.substring(0, match.index).split('\n').length;
        findings.push({
          rule: 'TYPE-001',
          severity: 'medium',
          category: 'TYPE_SAFETY',
          message: 'Uso de `any` detectado. Prefira `unknown` ou tipos específicos.',
          file: file.relative,
          loc: { line: lineNum }
        });
      }
    }

    // 2. Type assertions excessivas (3+ `as` no mesmo arquivo)
    const asMatches = content.match(/\bas\s+[A-Z]\w+/g);
    if (asMatches && asMatches.length >= 3) {
      findings.push({
        rule: 'TYPE-002',
        severity: 'low',
        category: 'TYPE_SAFETY',
        message: `Uso excessivo de type assertions (${asMatches.length} ocorrências). Considere refinamento de tipos.`,
        file: file.relative
      });
    }

    // 3. Missing return types em funções exportadas
    const exportFuncRegex = /export\s+(async\s+)?function\s+\w+\s*\([^)]*\)\s*(?![^:]*:)/g;
    let exportFuncMatch;
    while ((exportFuncMatch = exportFuncRegex.exec(content)) !== null) {
      const lineNum = content.substring(0, exportFuncMatch.index).split('\n').length;
      const funcName = exportFuncMatch[0].match(/function\s+(\w+)/)?.[1] || 'anonymous';
      findings.push({
        rule: 'TYPE-003',
        severity: 'low',
        category: 'TYPE_SAFETY',
        message: `Função exportada '${funcName}' sem tipo de retorno explícito.`,
        file: file.relative,
        loc: { line: lineNum }
      });
    }

    // 4. Missing return types em arrow functions exportadas
    const exportArrowRegex = /export\s+(const\s+\w+\s*=\s*(async\s*)?\([^)]*\)\s*(:\s*\w+)?\s*=>)/g;
    let arrowMatch;
    while ((arrowMatch = exportArrowRegex.exec(content)) !== null) {
      const matched = arrowMatch[0];
      const hasReturnType = matched.includes('): ');
      if (!hasReturnType) {
        const lineNum = content.substring(0, arrowMatch.index).split('\n').length;
        const name = matched.match(/const\s+(\w+)/)?.[1] || 'anonymous';
        findings.push({
          rule: 'TYPE-003',
          severity: 'low',
          category: 'TYPE_SAFETY',
          message: `Arrow function exportada '${name}' sem tipo de retorno explícito.`,
          file: file.relative,
          loc: { line: lineNum }
        });
      }
    }

    // 5. Optional chaining sem null check (acesso direto após optional)
    const optionalChainIssues = content.match(/\?\.\w+\.\w+/g);
    if (optionalChainIssues && optionalChainIssues.length > 5) {
      findings.push({
        rule: 'TYPE-004',
        severity: 'info',
        category: 'TYPE_SAFETY',
        message: 'Optional chaining extenso detectado. Considere extrair em variável com fallback.',
        file: file.relative
      });
    }

    // 6. Non-null assertion (!.) excessivo
    const nnAssertions = content.match(/!\./g);
    if (nnAssertions && nnAssertions.length > 3) {
      findings.push({
        rule: 'TYPE-005',
        severity: 'medium',
        category: 'TYPE_SAFETY',
        message: `Non-null assertions (!.) excessivas (${nnAssertions.length} ocorrências). Prefira validação explícita.`,
        file: file.relative
      });
    }

    return findings;
  }
}
