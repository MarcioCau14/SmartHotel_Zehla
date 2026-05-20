import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    // Fetch last 24 hours of telemetry
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const telemetry = await prisma.businessTelemetry.findMany({
      where: {
        ...(propertyId ? { propertyId } : {}),
        date: { gte: twentyFourHoursAgo }
      },
      orderBy: { date: 'asc' }
    });

    // Format for BITelemetryView
    const formatted = telemetry.map(t => ({
      date: t.date.getHours() + ':00',
      leadConversionRate: t.leadConversionRate,
      avgResponseTimeMs: t.avgResponseTimeMs,
      bookingSuccessRate: t.bookingSuccessRate,
      agentCloseRate: t.agentCloseRate,
      abandonmentCount: t.abandonmentCount
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('❌ [TELEMETRY_API_ERROR]', error);
    return NextResponse.json([], { status: 500 });
  }
}
