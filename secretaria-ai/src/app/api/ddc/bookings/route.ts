import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveTenantId } from '@/lib/ddc/auth-utils';

function mapBooking(b: any) {
  return {
    id: b.id,
    guestId: b.guestId,
    roomId: b.roomName,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    total: b.totalValue,
    status: b.status === 'checked_in' || b.status === 'checked_out' ? 'completed' as const : b.status as 'pending' | 'confirmed' | 'cancelled' | 'completed',
    paymentStatus: b.paymentStatus === 'paid' ? 'paid' as const : b.paymentStatus === 'refunded' ? 'refunded' as const : 'pending' as const,
    propertyId: b.tenantId,
    guest: b.guest ? { id: b.guest.id, name: b.guest.name, phone: b.guest.phone } : undefined,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    const tenantId = await resolveTenantId();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const guestId = searchParams.get('guestId');

    const where: any = { tenantId };
    if (status) where.status = status === 'completed' ? { in: ['checked_in', 'checked_out'] } : status;
    if (guestId) where.guestId = guestId;

    const bookings = await db.booking.findMany({
      where,
      include: { guest: { select: { id: true, name: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: { items: bookings.map(mapBooking), total: bookings.length, page: 1, limit: bookings.length, totalPages: 1 }
    });
  } catch (error) {
    console.error('[DDC bookings] Prisma error:', error);
    return NextResponse.json({ success: true, data: { items: [], total: 0, page: 1, limit: 0, totalPages: 0 } });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await resolveTenantId();
    const body = await request.json();
    if (!body.guestId || !body.checkIn || !body.checkOut || !body.total) {
      return NextResponse.json({ success: false, error: { code: '400', message: 'Missing required fields' } }, { status: 400 });
    }
    const checkIn = new Date(body.checkIn);
    const checkOut = new Date(body.checkOut);
    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    const booking = await db.booking.create({
      data: {
        tenantId,
        guestId: body.guestId,
        guestName: body.guestName || '',
        roomName: body.roomId || body.roomName || '',
        checkIn,
        checkOut,
        nights,
        guests: body.guests || 1,
        totalValue: body.total,
        status: body.status || 'pending',
        paymentMethod: body.paymentMethod || 'pix',
        paymentStatus: body.paymentStatus || 'pending',
        source: body.source || 'whatsapp_ai',
      }
    });
    return NextResponse.json({ success: true, data: mapBooking(booking) }, { status: 201 });
  } catch (error) {
    console.error('[DDC bookings POST] Error:', error);
    return NextResponse.json({ success: false, error: { code: '500', message: 'Failed to create booking' } }, { status: 500 });
  }
}
