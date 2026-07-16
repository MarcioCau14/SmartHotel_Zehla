import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { requireTenant } from '../../../../lib/auth';
import { withSecurity } from '@/lib/security/api-shield';

async function getHandler(_request: NextRequest, _ctx: any) {
  try {
    const tenantId = await requireTenant();
    
    // Calculate simple metrics for the dashboard
    const now = new Date();
    
    // 1. Total active reservations today
    const activeReservations = await prisma.reservation.count({
      where: {
        tenantId,
        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        checkIn: { lte: now },
        checkOut: { gte: now }
      }
    });

    // 2. Total Rooms
    const totalRooms = await prisma.room.count({
      where: { tenantId }
    });

    // 3. Occupancy Rate
    const occupancyRate = totalRooms > 0 ? (activeReservations / totalRooms) * 100 : 0;

    return NextResponse.json({
      activeReservations,
      totalRooms,
      occupancyRate: Math.round(occupancyRate),
      timestamp: now.toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized or invalid tenant' }, { status: 401 });
  }
}

export const GET = withSecurity(getHandler, { routeLabel: 'v1-metrics' });