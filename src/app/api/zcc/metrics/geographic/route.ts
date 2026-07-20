import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';
import { verifyZCCAccessOrReject } from '@/lib/zcc-security';

export async function GET(request: NextRequest) {
  const security = await verifyZCCAccessOrReject(request);
  if (!security.allowed) return security.response!;

  try {
    const dbOk = await isDatabaseAvailable();
    if (!dbOk) {
      // Return mock data for Vercel serverless
      return NextResponse.json({
        success: true,
        data: {
          pousadaByState: [
            { state: 'SC', count: 12 },
            { state: 'RJ', count: 8 },
            { state: 'BA', count: 6 },
            { state: 'SP', count: 5 },
            { state: 'RS', count: 4 },
          ],
          airbnbByState: [
            { state: 'RJ', count: 9 },
            { state: 'BA', count: 7 },
            { state: 'SC', count: 5 },
            { state: 'PE', count: 4 },
            { state: 'CE', count: 3 },
          ],
          mrrByState: {
            'SC': { pousada: 3200, airbnb: 1800, total: 5000 },
            'RJ': { pousada: 2400, airbnb: 2800, total: 5200 },
            'BA': { pousada: 1800, airbnb: 2200, total: 4000 },
            'SP': { pousada: 1500, airbnb: 800, total: 2300 },
            'RS': { pousada: 1200, airbnb: 400, total: 1600 },
            'PE': { pousada: 0, airbnb: 1200, total: 1200 },
            'CE': { pousada: 0, airbnb: 900, total: 900 },
          },
        },
        meta: { source: 'demo' },
      });
    }

    // Real DB queries
    const pousadaByState = await db.property.groupBy({
      by: ['state'],
      where: { state: { not: '' } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const airbnbByState = await db.airBProperty.groupBy({
      by: ['state'],
      where: { state: { not: '' } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: {
        pousadaByState: pousadaByState.map(s => ({ state: s.state, count: s._count.id })),
        airbnbByState: airbnbByState.map(s => ({ state: s.state, count: s._count.id })),
        mrrByState: {}, // Will be populated by financial endpoint
      },
      meta: { source: 'db' },
    });
  } catch (error) {
    console.error('Geographic metrics error:', error);
    return NextResponse.json({
      success: true,
      data: { pousadaByState: [], airbnbByState: [], mrrByState: {} },
      meta: { source: 'error' },
    });
  }
}
