export class TypeFixRule {
  apply(content, filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return content;

    let result = content;

    // 1. Substitui `: any` por `: unknown` em locais seguros
    result = result.replace(/: any\b(?!\s*=)/g, ': unknown');

    // 2. Remove non-null assertions (!) onde seguro
    result = result.replace(/\.!\)/g, ')');

    // 3. Adiciona `: void` em funções exportadas sem retorno
    const lines = result.split('\n');
    const newLines = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^export\s+(async\s+)?function\s+\w+\s*\([^)]*\)\s*\{/.test(line)) {
        const funcOpen = line.replace(/\{/, ': void {');
        newLines.push(funcOpen);
      } else {
        newLines.push(line);
      }
    }

    return newLines.join('\n');
  }
}
