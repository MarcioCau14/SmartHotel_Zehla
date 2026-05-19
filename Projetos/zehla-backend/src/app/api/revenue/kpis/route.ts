import { NextResponse } from 'next/server';

import { getRevenueKPIs } from '@/lib/store';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _GET() : void {
  try {
    const kpis = getRevenueKPIs();
    return NextResponse.json(kpis);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
  export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });

