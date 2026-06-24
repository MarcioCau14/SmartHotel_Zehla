import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
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
