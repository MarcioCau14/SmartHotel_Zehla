import fs from 'fs';

const files = [
  'src/app/api/agents/status/route.ts',
  'src/app/api/brain/chat/route.ts',
  'src/app/api/connect/analytics/route.ts',
  'src/app/api/connect/analytics/track/route.ts',
  'src/app/api/connect/links/[id]/route.ts',
  'src/app/api/connect/links/route.ts',
  'src/app/api/connect/profile/[slug]/route.ts',
  'src/app/api/connect/profile/route.ts',
  'src/app/api/crm/contacts/[id]/interactions/route.ts',
  'src/app/api/crm/contacts/[id]/route.ts',
  'src/app/api/crm/contacts/route.ts',
  'src/app/api/crm/deals/[id]/route.ts',
  'src/app/api/crm/deals/[id]/stage/route.ts',
  'src/app/api/crm/deals/route.ts',
  'src/app/api/crm/pipelines/route.ts',
  'src/app/api/crm/tasks/[id]/route.ts',
  'src/app/api/crm/tasks/route.ts',
  'src/app/api/system/heal/route.ts',
  'src/app/api/system/health/route.ts',
  'src/app/api/trends/alerts/route.ts',
  'src/app/api/trends/dashboard/route.ts',
  'src/app/api/trends/forecast/route.ts',
  'src/app/api/trends/keywords/route.ts',
  'src/app/api/trends/signals/route.ts',
  'src/app/api/trends/sync/route.ts',
  'src/lib/queues.ts',
  'src/lib/proxy-service.ts',
  'src/lib/trends/agent-integration.ts',
  'src/proxy.ts',
];

let fixed = 0;

for (const filePath of files) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;

    // Fix pattern: function body starts without 'try {' but has '} catch'
    // Add 'try {' after the function opening brace
    
    // Find all functions that have } catch without a matching try {
    // By counting brace depth and looking for catch
    
    const lines = content.split('\n');
    let inFunction = false;
    let fnBraceCount = 0;
    let fnStartLine = -1;
    let hasTry = false;
    let hasCatch = false;
    let result = [];
    let modified = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Detect function start
      if (/^async function _/.test(trimmed) && /\)\s*\{$/.test(trimmed)) {
        inFunction = true;
        fnStartLine = i;
        fnBraceCount = 1;
        hasTry = false;
        hasCatch = false;
        result.push(line);
        continue;
      }
      
      if (inFunction) {
        // Count braces
        for (const ch of line) {
          if (ch === '{') fnBraceCount++;
          if (ch === '}') fnBraceCount--;
        }
        
        // Check for try/catch
        if (/^\s*try\s*\{/.test(trimmed)) hasTry = true;
        if (/^\s*\}?\s*catch\s*\(/.test(trimmed)) hasCatch = true;
        
        // If function is closing (brace count reaches 0)
        if (fnBraceCount <= 0) {
          inFunction = false;
          
          // If the function had catch but no try, add try at the beginning
          if (hasCatch && !hasTry) {
            // Find the first body line (the first line after fn opening that's not blank/comment)
            let insertIdx = -1;
            for (let j = fnStartLine + 1; j <= i; j++) {
              const bodyLine = lines[j].trim();
              if (bodyLine && !bodyLine.startsWith('//') && !bodyLine.startsWith('/*')) {
                insertIdx = j;
                break;
              }
            }
            if (insertIdx >= 0) {
              // Get the indent from the first body line
              const indentMatch = lines[insertIdx].match(/^(\s*)/);
              const indent = indentMatch ? indentMatch[1] : '';
              lines.splice(insertIdx, 0, `${indent}try {`);
              modified = true;
              i++; // adjust index
            }
          }
        }
      }
      
      result.push(line);
    }
    
    if (modified) {
      fs.writeFileSync(filePath, lines.join('\n'));
      console.log('FIXED:', filePath);
      fixed++;
    }
  } catch (e) {
    console.log('ERROR:', filePath, e.message);
  }
}

console.log(`\nFixed ${fixed} files`);
