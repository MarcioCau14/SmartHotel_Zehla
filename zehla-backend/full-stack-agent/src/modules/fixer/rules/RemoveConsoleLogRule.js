/**
 * FULL_STACK_AGENT — RemoveConsoleLogRule
 * Remove console.log/debug/info preservando warn/error e respeitando fsa:keep.
 */

export class RemoveConsoleLogRule {
  apply(content, filePath) {
    // 1. Ignora arquivos de teste e scripts
    if (filePath.includes('.test.') || filePath.includes('.spec.') || filePath.includes('scripts/')) {
      return content;
    }

    // 2. Regex robusto que ignora linhas com // fsa:keep ou console.error/warn
    // Explicação: Busca console.log|debug|info que não começam com // e não têm fsa:keep na mesma linha
    const lines = content.split('\n');
    const newLines = lines.map(line => {
      if (/\/\/.*fsa:keep/.test(line)) return line;
      
      // Remove console.log, console.debug, console.info
      // Preserva console.warn, console.error
      return line.replace(/console\.(log|debug|info)\s*\(.*?\);?/g, '');
    });

    return newLines.join('\n');
  }
}
