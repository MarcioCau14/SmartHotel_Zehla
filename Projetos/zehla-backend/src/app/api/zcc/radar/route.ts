import { NextResponse } from 'next/server';

import { RadarService } from '@/lib/zcc/radar-service';

import { withApiSecurity } from '@/lib/server/with-api-security';

/**
 * API do Radar Neural (ZCC)
 * Retorna os dados consolidados do mapa de calor geográfico via Redis.
 */
async function _GET() : void {
  try {
    const data = await RadarService.getHeatmap();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('❌ [RADAR API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
  export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });


/**
 * Trigger de atualização manual (apenas para o sistema)
 */
async function _POST() : void {
  try {
    const data = await RadarService.consolidateHeatmap();
    return NextResponse.json({ success: true, updated: data.length });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to update radar' }, { status: 500 });
  }
}
  export const POST = withApiSecurity(_POST, { rateLimit: { limit: 100, windowSeconds: 60 } });

