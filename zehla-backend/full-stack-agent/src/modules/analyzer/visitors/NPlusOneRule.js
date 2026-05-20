const LOOP_PATTERNS = [
  /\bfor\s*\(/,
  /\bwhile\s*\(/,
  /\.map\s*\(/,
  /\.forEach\s*\(/,
  /\.filter\s*\(/,
  /\.reduce\s*\(/,
];

const PRISMA_CALL_PATTERNS = [
  /prisma\.\w+\.(findMany|findFirst|findUnique|findUniqueOrThrow|findFirstOrThrow|count|aggregate)\s*\(/,
  /db\.\w+\.(findMany|findFirst|findUnique|findUniqueOrThrow|findFirstOrThrow|count|aggregate)\s*\(/,
];

function extractBlockRange(lines, startLine) {
  const line = lines[startLine - 1] || '';
  let braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
  let endLine = startLine;
  while (braceCount > 0 && endLine < lines.length) {
    endLine++;
    const currentLine = lines[endLine - 1] || '';
    braceCount += (currentLine.match(/\{/g) || []).length;
    braceCount -= (currentLine.match(/\}/g) || []).length;
  }
  return startLine + 1;
}

function isInsideLoop(content, prismaLineIndex) {
  const lines = content.split('\n');
  const blockStack = [];
  let currentBlock = { type: 'global', startLine: 1, endLine: lines.length, blocks: [] };
  const root = currentBlock;
  const stack = [root];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    let current = stack[stack.length - 1];

    const opensBrace = (line.match(/\{/g) || []).length;
    const closesBrace = (line.match(/\}/g) || []).length;

    let blockType = null;
    if (LOOP_PATTERNS.some(p => p.test(line)) && opensBrace > 0) {
      blockType = 'loop';
    } else if (opensBrace > 0 && !blockType) {
      blockType = 'block';
    } else if (opensBrace > 0) {
      blockType = 'block';
    }

    for (let b = 0; b < opensBrace; b++) {
      const type = (b === 0 && blockType) ? blockType : 'block';
      const newBlock = { type, startLine: lineNum, endLine: lineNum, blocks: [] };
      current.blocks.push(newBlock);
      stack.push(newBlock);
      current = newBlock;
    }

    if (current) {
      current.endLine = lineNum;
    }

    for (let c = 0; c < closesBrace; c++) {
      if (stack.length > 1) {
        const popped = stack.pop();
        if (stack[stack.length - 1]) {
          stack[stack.length - 1].endLine = lineNum;
        }
      }
    }
  }

  function isInsideLoopBlock(block, targetLine) {
    if (block.startLine <= targetLine && targetLine <= block.endLine) {
      if (block.type === 'loop') return true;
      for (const child of block.blocks) {
        const result = isInsideLoopBlock(child, targetLine);
        if (result) return result;
      }
    }
    return false;
  }

  return isInsideLoopBlock(root, prismaLineIndex);
}

export const NPlusOneVisitor = {
  CallExpression({ content, filename }, { findings }) {
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      for (const pattern of PRISMA_CALL_PATTERNS) {
        const match = line.match(pattern);
        if (match) {
          if (isInsideLoop(content, lineNum)) {
            const methodName = match[1];
            findings.push({
              rule: 'AST-001',
              severity: 'high',
              category: 'PERFORMANCE',
              message: `Query N+1 detectada: prisma.${methodName}() chamado dentro de um laço de repetição. Considere usar findMany() com filtro IN.`,
              file: filename,
              loc: { line: lineNum, column: match.index + 1 }
            });
          }
        }
      }
    }
  }
};
