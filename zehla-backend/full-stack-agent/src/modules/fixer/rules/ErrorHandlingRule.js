export class ErrorHandlingRule {
  apply(content, filePath) {
    const lines = content.split('\n');
    const newLines = [];
    let modified = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      newLines.push(line);

      // Detecta async function sem try/catch no corpo
      if (/^\s*(export\s+)?(async\s+)?function\s+\w+\s*\(/.test(line) && line.endsWith('{')) {
        const funcBody = extractFunctionBody(lines, i);
        if (funcBody && !funcBody.includes('try ') && !funcBody.includes('.catch(')) {
          const indent = line.match(/^\s*/)[0];
          newLines.push(`${indent}  try {`);
          modified = true;
        }
      }

      // Arrow functions async em exports
      if (/^\s*(export\s+)?(const|let|var)\s+\w+\s*=\s*async\s*\(/.test(line) && line.endsWith('{')) {
        const bodyStart = content.split('\n').indexOf(line);
        if (bodyStart >= 0) {
          const funcBody = extractFunctionBody(lines, i);
          if (funcBody && !funcBody.includes('try ') && !funcBody.includes('.catch(')) {
            const indent = line.match(/^\s*/)[0];
            newLines.push(`${indent}  try {`);
            modified = true;
          }
        }
      }
    }

    return modified ? newLines.join('\n') : content;
  }
}

function extractFunctionBody(lines, startIdx) {
  let depth = 0;
  let started = false;
  const body = [];
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    for (const ch of line) {
      if (ch === '{') { depth++; started = true; }
      else if (ch === '}') depth--;
    }
    if (started) body.push(line);
    if (started && depth === 0) break;
  }
  return body.join('\n');
}
