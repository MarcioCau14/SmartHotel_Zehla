/**
 * ZMG Marketing Test
 * Run with: npx tsx src/lib/zmg/test-marketing.ts
 */

import { ZMGMarketingOrchestrator } from './marketing-orchestrator';

async function test() {
  const filePath = '/Users/marciocau/Downloads/PLANILHAS_MARKETING_BR_/LEADS_PRO.xlsx';
  await ZMGMarketingOrchestrator.runCampaignFromExcel(filePath, 'PRO');
}

test().catch(console.error);
