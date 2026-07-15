import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveTenantId, mapBooking } from '@/lib/ddc/ddc-mapper';
import { apiRatelimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const tenantId = await resolveTenantId();
    if (!tenantId || tenantId === 'client-001') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { success } = await apiRatelimit.limit(tenantId);
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

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
    if (!tenantId || tenantId === 'client-001') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { success } = await apiRatelimit.limit(tenantId);
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

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
