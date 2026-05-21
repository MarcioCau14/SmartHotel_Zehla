import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { withApiSecurity } from '@/lib/server/with-api-security';

async function _GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const property = await prisma.property.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!property) {
      return NextResponse.json({ error: 'Propriedade não encontrada' }, { status: 404 });
    }

    const settings = await prisma.revenueSettings.findUnique({
      where: { propertyId: property.id },
    });

    const pricingLogs = await prisma.revenuePricingLog.findMany({
      where: { propertyId: property.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Calculate revenue impact
    const totalLogs = pricingLogs.length;
    const extraRevenue = pricingLogs.reduce((sum, log) => {
      const diff = log.finalPrice - log.originalPrice;
      return sum + (diff > 0 ? diff : 0);
    }, 0);

    return NextResponse.json({
      settings: settings || {
        propertyId: property.id,
        dynamicPricingEnabled: false,
        minPrice: null,
        maxPrice: null,
        weekendMultiplier: 1.10,
        seasonalMultiplier: 1.20,
      },
      pricingLogs,
      stats: {
        totalCalculations: totalLogs,
        extraRevenueGenerated: extraRevenue,
        avgOccupancyRate: totalLogs > 0
          ? pricingLogs.reduce((sum, log) => sum + log.occupancyRate, 0) / totalLogs
          : 0,
      },
    });
  } catch (error) {
    console.error('[API:REVENUE:SETTINGS] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

async function _PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const property = await prisma.property.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!property) {
      return NextResponse.json({ error: 'Propriedade não encontrada' }, { status: 404 });
    }

    const body = await req.json();

    const settings = await prisma.revenueSettings.upsert({
      where: { propertyId: property.id },
      create: {
        propertyId: property.id,
        dynamicPricingEnabled: body.dynamicPricingEnabled ?? false,
        minPrice: body.minPrice,
        maxPrice: body.maxPrice,
        weekendMultiplier: body.weekendMultiplier ?? 1.10,
        seasonalMultiplier: body.seasonalMultiplier ?? 1.20,
        leadTimeDiscounts: body.leadTimeDiscounts,
        occupancyThresholds: body.occupancyThresholds,
      },
      update: {
        dynamicPricingEnabled: body.dynamicPricingEnabled,
        minPrice: body.minPrice,
        maxPrice: body.maxPrice,
        weekendMultiplier: body.weekendMultiplier,
        seasonalMultiplier: body.seasonalMultiplier,
        leadTimeDiscounts: body.leadTimeDiscounts,
        occupancyThresholds: body.occupancyThresholds,
      },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('[API:REVENUE:SETTINGS] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const GET = withApiSecurity(_GET, {
  rateLimit: { limit: 30, windowSeconds: 60 },
});

export const PUT = withApiSecurity(_PUT, {
  rateLimit: { limit: 10, windowSeconds: 60 },
});
