import fs from 'fs';
import path from 'path';

let fixedCount = 0;

function hasFunctionBefore(content, idx) {
  const before = content.slice(0, idx);
  return /\b(function\s+\w+\s*\(|=>\s*\{|\bconst\s+\w+\s*=\s*(async\s+)?\(?)/.test(before);
}

function fixTryBlocks(content) {
  const lines = content.split('\n');
  const result = [];
  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const indent = line.match(/^\s*/)[0];

    // Check if this is a 'try {' line that's part of the corruption
    if (trimmed === 'try {') {
      // Look ahead: is the NEXT line at the same indent level as 'try {' ?
      // That means the 'try {' was inserted without proper indentation of the body
      const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
      const nextIndent = nextLine.match(/^\s*/)[0];
      
      if (nextIndent === indent) {
        // The try block body has same indentation as try itself = corruption
        // Skip this line entirely (remove the 'try {')
        modified = true;
        console.log(`  Removed 'try {' at line ${i + 1}: ${line}`);
        continue;
      }
      
      // Also check if the try is at the start of a function body and has no catch
      // Look at the previous line for function signature
      const prevLineIdx = i - 1;
      while (prevLineIdx >= 0 && lines[prevLineIdx].trim() === '') prevLineIdx--;
      
      if (prevLineIdx >= 0) {
        const prevTrimmed = lines[prevLineIdx].trim();
        // Check if prev line ends with '): void {' or '): Promise<...> {' or ') {'
        // or if this try is part of a return type (like '): void {\n  try {')
        if (/\)\s*(:\s*.*)?\{\s*$/.test(prevTrimmed)) {
          // Check if this function ends without a catch block
          let braceCount = 0;
          let hasCatch = false;
          let fnEndIdx = -1;
          let lookingForCatch = false;
          
          for (let j = i + 1; j < lines.length; j++) {
            const l = lines[j].trim();
            if (l.startsWith('try {') || l === 'try {') {
              braceCount++;
            } else if (l === '}' || l === '};') {
              if (braceCount === 0) {
                fnEndIdx = j;
                break;
              }
              braceCount--;
            } else if (l.startsWith('catch') || l.startsWith('} catch') || l === '} catch (error) {' || l.startsWith('catch (')) {
              hasCatch = true;
            }
            // Track general brace balance
            for (const ch of lines[j]) {
              if (ch === '{') braceCount++;
              if (ch === '}') braceCount--;
            }
          }
          
          if (!hasCatch || fnEndIdx > 0) {
            // Remove the try line and its catch-less structure
            // Actually this is more complex - let's just remove 'try {' for now
            modified = true;
            console.log(`  Removing 'try {' at line ${i + 1}`);
            continue;
          }
        }
      }
    }

    result.push(line);
  }

  if (modified) {
    return result.join('\n');
  }
  return content;
}

// Fix specific known patterns more aggressively
function fixSpecific(content) {
  let modified = content;
  
  // Pattern: Function signature followed by 'try {' on next line (same indent as body)
  // Remove the 'try {' line
  modified = modified.replace(
    /^((\s*)export\s+(async\s+)?function\s+\w+[\s\S]*?\)\s*:\s*(void|Promise<\w+>)\s*\{)\n\s*try\s+\{\n/gm,
    '$1\n'
  );
  
  // Pattern: return type '): void {\n  try {\n  ' → remove try {
  modified = modified.replace(
    /^(  )try {\n\1/gm,
    ''
  );
  
  // Pattern: return type '): void {\n    try {\n    ' → remove try {
  modified = modified.replace(
    /^(    )try {\n\1/gm,
    ''
  );
  
  // Pattern: return type '): void {\n      try {\n      ' → remove try {
  modified = modified.replace(
    /^(      )try {\n\1/gm,
    ''
  );
  
  return modified;
}

console.log('=== Fixing try-block corruption ===\n');

function walk(dir) {
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (!file.startsWith('.')) walk(fullPath);
      } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const original = content;
        
        let result = fixSpecific(content);
        result = fixTryBlocks(result);
        
        if (result !== original) {
          fs.writeFileSync(fullPath, result);
          console.log('FIXED:', fullPath);
          fixedCount++;
        }
      }
    }
  } catch (e) {
    console.error('ERROR:', e.message);
  }
}

walk('src');
console.log(`\nTotal files fixed: ${fixedCount}`);
