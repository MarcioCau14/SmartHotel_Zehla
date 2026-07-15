import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withSecurity } from '@/lib/security/api-shield';

async function getHandler(_request: NextRequest, _ctx: any) {
  try {
    const bookings = await db.booking.findMany({
      orderBy: { checkIn: 'desc' },
      take: 50,
      include: { guest: true },
    });
    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    return NextResponse.json({ success: true, bookings: [] });
  }
}

export const GET = withSecurity(getHandler, { routeLabel: 'dashboard-bookings' });