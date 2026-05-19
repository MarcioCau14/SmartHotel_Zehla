/**
 * FULL_STACK_AGENT — OrganizeImportsRule
 * Ordena e agrupa imports (Nativos -> Externos -> Absolutos -> Relativos).
 */

export class OrganizeImportsRule {
  apply(content) {
    const lines = content.split('\n');
    const importLines = [];
    const otherLines = [];
    
    // 1. Separa imports do resto do código
    let inImportBlock = true;
    for (const line of lines) {
      if (line.trim().startsWith('import ') || (line.trim() === '' && inImportBlock)) {
        if (line.trim() !== '') importLines.push(line);
      } else {
        inImportBlock = false;
        otherLines.push(line);
      }
    }

    if (importLines.length === 0) return content;

    // 2. Classifica os imports
    const groups = {
      nativos: [],   // node:
      externos: [],  // react, next, etc.
      absolutos: [], // @/, src/
      relativos: [], // ./ , ../
      types: []      // import type
    };

    importLines.forEach(line => {
      if (line.includes('type ')) groups.types.push(line);
      else if (line.includes('node:')) groups.nativos.push(line);
      else if (line.includes("'./") || line.includes("'../")) groups.relativos.push(line);
      else if (line.includes("'@/") || line.includes("'src/")) groups.absolutos.push(line);
      else groups.externos.push(line);
    });

    // 3. Ordena alfabeticamente dentro dos grupos
    Object.keys(groups).forEach(key => groups[key].sort());

    // 4. Remonta o arquivo
    const sortedImports = [
      ...groups.nativos,
      ...(groups.nativos.length > 0 ? [''] : []),
      ...groups.externos,
      ...(groups.externos.length > 0 ? [''] : []),
      ...groups.absolutos,
      ...(groups.absolutos.length > 0 ? [''] : []),
      ...groups.relativos,
      ...(groups.relativos.length > 0 ? [''] : []),
      ...groups.types
    ];

    return [...sortedImports, '', ...otherLines].join('\n');
  }
}
