import { NextResponse } from 'next/server';
import prisma from '../../../../../prisma/db';
import { requireTenant } from '../../../../lib/auth';

export async function GET(request: Request) {
  try {
    const tenantId = await requireTenant();
    
    // Fetch all reservations for this specific Tenant (Pousada)
    const reservations = await prisma.reservation.findMany({
      where: { tenantId },
      include: {
        guest: true,
        room: true,
      },
      orderBy: { checkIn: 'asc' },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized or invalid tenant' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const tenantId = await requireTenant();
    const body = await request.json();
    
    const { guestId, roomId, checkIn, checkOut, totalPrice, source } = body;

    const reservation = await prisma.reservation.create({
      data: {
        tenantId,
        guestId,
        roomId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        totalPrice,
        source: source || 'DIRECT',
      }
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}
