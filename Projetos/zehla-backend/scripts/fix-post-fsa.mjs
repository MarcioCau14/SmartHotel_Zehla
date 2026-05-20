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

    // 1. Remove import { withApiSecurity } from '@/lib/server/with-api-security';
    content = content.replace(/^import \{ withApiSecurity \} from ['"]@\/lib\/server\/with-api-security['"];\n/gm, '');
    content = content.replace(/^import \{ withApiSecurity \} from ['"]@\/lib\/server\/with-api-security['"];\s*\n/gm, '');

    // 2. Convert function declaration patterns:

    // Pattern: async function _GET(req, { params }) : void { ...export const GET = withApiSecurity...
    // → export async function GET(req, { params }: ...) { ... no export const GET
    
    // Remove export const XXX = withApiSecurity lines
    content = content.replace(/^\s*export const (GET|POST|PUT|PATCH|DELETE) = withApiSecurity\(_\1, \{([^}]+)\}\);\n*/gm, '');
    
    // Convert async function _XXX to export async function XXX
    content = content.replace(/async function _(GET|POST|PUT|PATCH|DELETE)\(/g, 'export async function $1(');
    
    // Remove ': void' from function signatures
    content = content.replace(/(export async function \w+\([^)]*\)) : void/g, '$1');
    content = content.replace(/(export async function \w+\([^)]*\)) : Promise<\w+>/g, '$1');

    // 3. Fix specifically the 'catch' indentation issue
    // The pattern: try { at function indent, body at function indent, } catch at wrong indent
    // This is complex - let's just standardize the try/catch
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('FIXED:', filePath);
      fixed++;
    }
  } catch (e) {
    console.log('ERROR:', filePath, e.message);
  }
}

console.log(`\nFixed ${fixed} files`);
