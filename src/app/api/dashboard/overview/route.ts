import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withSecurity } from '@/lib/security/api-shield';

async function getHandler(_request: NextRequest, _ctx: any) {
  try {
    const totalTenants = await db.tenant.count();
    const activeTenants = await db.tenant.count({ where: { status: 'active' } });
    const totalGuests = await db.guest.count();
    const totalBookings = await db.booking.count();
    const activeSubscriptions = await db.subscription.count({ where: { status: 'active' } });

    return NextResponse.json({
      success: true,
      overview: {
        totalTenants,
        activeTenants,
        totalGuests,
        totalBookings,
        activeSubscriptions,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: true, overview: { totalTenants: 0, activeTenants: 0, totalGuests: 0, totalBookings: 0, activeSubscriptions: 0 } });
  }
}

export const GET = withSecurity(getHandler, { routeLabel: 'dashboard-overview' });