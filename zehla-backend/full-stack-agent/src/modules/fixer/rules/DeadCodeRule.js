export class DeadCodeRule {
  apply(content, filePath) {
    const lines = content.split('\n');
    const newLines = [];
    let modified = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // 1. Remove console.log linhas inteiras (seguindo o padrão)
      if (/^\s*console\.(log|debug|info)\s*\(/.test(trimmed) && !trimmed.includes('fsa:keep')) {
        modified = true;
        continue;
      }

      // 2. Remove variáveis declaradas mas não usadas
      // Heurística: variável declarada em linha própria, mas sem referência posterior
      const declMatch = trimmed.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(.+)$/);
      if (declMatch) {
        const varName = declMatch[1];
        const value = declMatch[2];

        // Pula se:
        // - É um import/export
        // - É valor trivial (string, número, booleano) — pode ser constante usada
        // - O valor contém função/chamada (pode ter side effects)
        const isTrivial = /^['"`0-9\-\d.]+;?$/.test(value.trim()) || /^(true|false|null|undefined);?$/.test(value.trim());
        const hasSideEffect = /\(|=>|function|new\s+\w+/.test(value);

        if (isTrivial && !hasSideEffect) {
          // Verifica se a variável é usada depois
          const remainingContent = lines.slice(i + 1).join('\n');
          const usageRegex = new RegExp(`[^$_a-zA-Z0-9]${varName}[^$_a-zA-Z0-9]`);
          if (!usageRegex.test(remainingContent)) {
            // Comentário com side effect: pula linhas órfãs
            modified = true;
            continue;
          }
        }
      }

      // 3. Remove linhas de comentário órfão (TODO/FIXME/HACK) — só se não tiver código na linha
      if (/^\s*\/\/\s*(TODO|FIXME|HACK|XXX)\b/.test(trimmed)) {
        // Verifica se a linha anterior também é comentário ou vazia
        const prevLine = i > 0 ? lines[i - 1].trim() : '';
        if (prevLine === '' || prevLine.startsWith('//')) {
          modified = true;
          continue;
        }
      }

      newLines.push(line);
    }

    return modified ? newLines.join('\n') : content;
  }
}
